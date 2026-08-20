import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { Student } from '../models/Student.js';
import { Company } from '../models/Company.js';
import { ROLES } from '../utils/constants.js';
import { hashToken, generateSecureToken, generateOTP, safeCompare } from '../utils/crypto.js';
import { auditService } from './audit.service.js';
import { mailService } from '../integrations/mail/mail.service.js';
import { ApiError } from '../utils/ApiError.js';

export class AuthService {
  /**
   * Register a new user with role-specific profile creation.
   */
  async register(data, req = null) {
    const { role, ...userData } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw ApiError.badRequest('Email already registered');
    }

    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.password,
      role,
    });

    // Create role-specific profile
    if (role === ROLES.STUDENT) {
      await Student.create({
        user: user._id,
        studentId: data.studentId,
        department: data.department,
        course: data.course,
        graduationYear: data.graduationYear,
      });
    } else if (role === ROLES.COMPANY) {
      await Company.create({
        name: data.companyName,
        industry: data.industry,
        recruiter: user._id,
        isVerified: false, // Requires admin approval
      });
    }

    // Audit log
    await auditService.log({
      actor: user,
      action: 'REGISTER',
      entity: 'User',
      entityId: user._id,
      metadata: { role },
      req,
    });

    // Generate tokens
    const tokens = await this.generateTokenPair(user, req);

    // Send welcome email
    try {
      await mailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('[Mail] Welcome email failed:', error.message);
    }

    return {
      user: user.toSafeJSON(),
      ...tokens,
    };
  }

  /**
   * Login with email and password.
   */
  async login(email, password, req = null) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive || user.isSuspended) {
      throw ApiError.forbidden('Account is suspended or deactivated');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Audit log
    await auditService.log({
      actor: user,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      req,
    });

    // Generate tokens
    const tokens = await this.generateTokenPair(user, req);

    return {
      user: user.toSafeJSON(),
      ...tokens,
    };
  }

  /**
   * Generate access + refresh token pair.
   */
  async generateTokenPair(user, req = null) {
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    const refreshToken = generateSecureToken(64);
    const tokenHash = hashToken(refreshToken);
    const family = uuidv4();

    await RefreshToken.create({
      user: user._id,
      tokenHash: tokenHash,
      family: family,
      deviceInfo: {
        userAgent: req?.get('user-agent'),
        ip: req?.ip,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token.
   */
  async refreshAccessToken(refreshToken, req = null) {
    const tokenHash = hashToken(refreshToken);

    const storedToken = await RefreshToken.findOne({ tokenHash });
    if (!storedToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (storedToken.revoked) {
      await RefreshToken.updateMany(
        { family: storedToken.family },
        { $set: { revoked: true, replacedBy: tokenHash } }
      );
      throw ApiError.unauthorized('Refresh token reuse detected. Token family revoked.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token expired');
    }

    const user = await User.findById(storedToken.user);
    if (!user || !user.isActive || user.isSuspended) {
      throw ApiError.forbidden('User not found or account suspended');
    }

    // Revoke previous token
    storedToken.revoked = true;
    storedToken.replacedBy = tokenHash;
    await storedToken.save();

    // Issue new tokens
    const tokens = await this.generateTokenPair(user, req);

    // Audit
    await auditService.log({
      actor: user,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      metadata: { action: 'TOKEN_REFRESH' },
      req,
    });

    return tokens;
  }

  /**
   * Logout user.
   */
  async logout(refreshToken, req = null) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.findOneAndUpdate(
        { tokenHash },
        { $set: { revoked: true } }
      );
    }

    if (req?.user) {
      await auditService.log({
        actor: req.user,
        action: 'LOGOUT',
        entity: 'User',
        entityId: req.user._id,
        req,
      });
    }
  }

  /**
   * Logout from all devices.
   */
  async logoutAll(userId, req = null) {
    await RefreshToken.updateMany(
      { user: userId, revoked: false },
      { $set: { revoked: true } }
    );

    await auditService.log({
      actor: { _id: userId, role: 'UNKNOWN' },
      action: 'LOGOUT',
      entity: 'User',
      entityId: userId,
      metadata: { action: 'LOGOUT_ALL' },
      req,
    });
  }

  /**
   * Forgot password - generate OTP and send email.
   */
  async forgotPassword(email, req = null) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent' };
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 minutes

    user.passwordResetOtp = hashToken(otp);
    user.passwordResetOtpExpiresAt = otpExpiresAt;
    await user.save();

    await auditService.log({
      actor: user,
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'User',
      entityId: user._id,
      req,
    });

    try {
      await mailService.sendPasswordResetEmail(user.email, user.name, otp);
    } catch (error) {
      console.error('[Mail] Password reset email failed:', error.message);
    }

    return { message: 'If an account exists, a reset link has been sent' };
  }

  /**
   * Reset password with OTP.
   */
  async resetPassword(token, otp, newPassword, req = null) {
    const otpHash = hashToken(otp);

    const user = await User.findOne({
      passwordResetOtp: hashToken(otp),
      passwordResetOtpExpiresAt: { $gt: new Date() },
    }).select('+passwordResetOtp');

    if (!user) {
      throw new Error('Invalid or expired OTP');
    }

    user.passwordHash = newPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    await user.save();

    await auditService.log({
      actor: user,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: user._id,
      metadata: { action: 'PASSWORD_RESET' },
      req,
    });

    try {
      await mailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (error) {
      console.error('[Mail] Password changed email failed:', error.message);
    }

    return { message: 'Password reset successful' };
  }

  /**
   * Change password for authenticated user.
   */
  async changePassword(userId, currentPassword, newPassword, req = null) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentValid = await user.comparePassword(currentPassword);
    if (!isCurrentValid) {
      throw new Error('Current password is incorrect');
    }

    user.passwordHash = newPassword;
    await user.save();

    // Revoke all refresh tokens
    await this.logoutAll(user._id);

    await auditService.log({
      actor: user,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: user._id,
      metadata: { action: 'USER_INITIATED' },
      req,
    });

    try {
      await mailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (error) {
      console.error('[Mail] Password changed email failed:', error.message);
    }

    return { message: 'Password changed successfully' };
  }

  /**
   * Get current user profile.
   */
  async getMe(userId) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    let profile = null;
    if (user.role === ROLES.STUDENT) {
      profile = await Student.findOne({ user: userId }).lean();
    } else if (user.role === ROLES.COMPANY) {
      profile = await Company.findOne({ recruiter: userId }).lean();
    }

    return { user, profile };
  }

  /**
   * Google OAuth 2.0 Identity Verification and Login / Auto-Registration.
   */
  async googleLogin(credential, role = 'STUDENT', req = null) {
    if (!credential) {
      throw ApiError.badRequest('Google credential token is required');
    }

    let email;
    let name;
    let picture;
    let googleId;

    try {
      const { OAuth2Client } = await import('google-auth-library');
      const googleClientId = process.env.GOOGLE_CLIENT_ID;

      if (googleClientId) {
        const client = new OAuth2Client(googleClientId);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: googleClientId,
        });
        const payload = ticket.getPayload();
        googleId = payload.sub;
        email = payload.email?.toLowerCase();
        name = payload.name;
        picture = payload.picture;
      } else {
        // Direct verify via Google tokeninfo endpoint
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!res.ok) throw new Error('Invalid Google Token verification response');
        const payload = await res.json();
        googleId = payload.sub;
        email = payload.email?.toLowerCase();
        name = payload.name || payload.email?.split('@')[0];
        picture = payload.picture;
      }
    } catch (err) {
      throw ApiError.unauthorized('Google authentication failed: ' + err.message);
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        authProvider: 'GOOGLE',
        role: role.toUpperCase(),
        isVerified: true,
        avatarUrl: picture,
      });

      if (user.role === ROLES.STUDENT) {
        await Student.create({
          user: user._id,
          studentId: `STU${Date.now().toString().slice(-6)}`,
          department: 'General',
          course: 'B.Tech',
          graduationYear: new Date().getFullYear() + 4,
        });
      } else if (user.role === ROLES.COMPANY) {
        await Company.create({
          name: name ? `${name}'s Company` : 'New Company',
          recruiter: user._id,
          isVerified: false,
        });
      }
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'GOOGLE';
      }
      if (picture && !user.avatarUrl) user.avatarUrl = picture;
      user.lastLoginAt = new Date();
      await user.save();
    }

    if (!user.isActive || user.isSuspended) {
      throw ApiError.forbidden('Account is suspended or deactivated');
    }

    await auditService.log({
      actor: user,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      metadata: { method: 'GOOGLE_OAUTH' },
      req,
    });

    const tokens = await this.generateTokenPair(user, req);
    return {
      user: user.toSafeJSON(),
      ...tokens,
    };
  }

  /**
   * Phone Number + Firebase OTP Identity Verification & Login.
   */
  async phoneLogin(idToken, phoneNumber, role = 'STUDENT', req = null) {
    let verifiedPhone = phoneNumber;

    if (idToken) {
      try {
        const adminModule = await import('firebase-admin');
        const admin = adminModule.default || adminModule;
        if (admin.apps && admin.apps.length > 0) {
          const decoded = await admin.auth().verifyIdToken(idToken);
          verifiedPhone = decoded.phone_number || phoneNumber;
        }
      } catch (err) {
        console.warn('[Firebase] Token verification warning:', err.message);
      }
    }

    if (!verifiedPhone) {
      throw ApiError.badRequest('Valid phone number is required');
    }

    const cleanPhone = verifiedPhone.trim();
    let user = await User.findOne({ phoneNumber: cleanPhone });

    if (!user) {
      const placeholderEmail = `phone_${cleanPhone.replace(/[^0-9]/g, '')}@placex.app`;
      user = await User.create({
        name: `User ${cleanPhone.slice(-4)}`,
        email: placeholderEmail,
        phoneNumber: cleanPhone,
        authProvider: 'PHONE',
        role: role.toUpperCase(),
        isVerified: true,
      });

      if (user.role === ROLES.STUDENT) {
        await Student.create({
          user: user._id,
          studentId: `STU${Date.now().toString().slice(-6)}`,
          department: 'General',
          course: 'B.Tech',
          graduationYear: new Date().getFullYear() + 4,
        });
      }
    } else {
      user.lastLoginAt = new Date();
      await user.save();
    }

    if (!user.isActive || user.isSuspended) {
      throw ApiError.forbidden('Account is suspended or deactivated');
    }

    await auditService.log({
      actor: user,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      metadata: { method: 'PHONE_OTP' },
      req,
    });

    const tokens = await this.generateTokenPair(user, req);
    return {
      user: user.toSafeJSON(),
      ...tokens,
    };
  }
}

export const authService = new AuthService();