import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { authLimiter, strictLimiter } from '../middlewares/rateLimit.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/v1/auth/register
export const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const result = await authService.register(value, req);
  res.cookie('placex_rt', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh'
  });

  ApiResponse.created(res, 'Registration successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const result = await authService.login(value.email, value.password, req);

  res.cookie('placex_rt', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh'
  });

  ApiResponse.ok(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.placex_rt || req.body.refreshToken;
  await authService.logout(refreshToken, req);

  res.clearCookie('placex_rt', { path: '/api/v1/auth/refresh' });
  ApiResponse.ok(res, 'Logout successful');
});

// POST /api/v1/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.placex_rt || req.body.refreshToken;
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token required');
  }

  const result = await authService.refreshAccessToken(refreshToken, req);

  res.cookie('placex_rt', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh'
  });

  ApiResponse.ok(res, 'Token refreshed', {
    accessToken: result.accessToken,
  });
});

// POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const result = await authService.forgotPassword(value.email, req);
  ApiResponse.ok(res, result.message);
});

// POST /api/v1/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const result = await authService.resetPassword(value.token, value.otp, value.password, req);
  ApiResponse.ok(res, result.message);
});

// POST /api/v1/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const result = await authService.changePassword(req.user._id, value.currentPassword, value.newPassword, req);
  ApiResponse.ok(res, result.message);
});

// GET /api/v1/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user._id);
  ApiResponse.ok(res, 'Profile fetched', result);
});

// POST /api/v1/auth/google
export const google = asyncHandler(async (req, res) => {
  const { credential, role = 'STUDENT' } = req.body;
  const result = await authService.googleLogin(credential, role, req);

  res.cookie('placex_rt', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
  });

  ApiResponse.ok(res, 'Google login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

// POST /api/v1/auth/phone
export const phone = asyncHandler(async (req, res) => {
  const { idToken, phoneNumber, role = 'STUDENT' } = req.body;
  const result = await authService.phoneLogin(idToken, phoneNumber, role, req);

  res.cookie('placex_rt', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
  });

  ApiResponse.ok(res, 'Phone login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

// Route definitions
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, google);
router.post('/phone', authLimiter, phone);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', strictLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getMe);

export default router;
