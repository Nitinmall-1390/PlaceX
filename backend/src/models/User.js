import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE', 'PHONE'],
      default: 'LOCAL',
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    emailVerifiedAt: {
      type: Date,
    },
    passwordResetOtp: {
      type: String,
      select: false,
    },
    passwordResetOtpExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1, createdAt: -1 });

// ─── Virtuals ──────────────────────────────────────────────────────────────────
// profile virtual is defined via getters if needed

// ─── Instance methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.passwordResetOtp;
  return obj;
};

// ─── Static helpers ────────────────────────────────────────────────────────────
userSchema.statics.isRole = function (role) {
  return this.role === role;
};

// ─── Pre-save hook ────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
  next();
});

export const User = mongoose.model('User', userSchema);
export default User;