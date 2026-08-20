import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import rateLimit from 'express-rate-limit';

const createLimiter = (options) => {
  const limiter = rateLimit({
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
  });
  return limiter;
};

export const authLimiter = createLimiter({
  ...config.rateLimit.auth,
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts. Please try again later.',
});

export const strictLimiter = createLimiter({
  ...config.rateLimit.strict,
  message: 'Too many attempts. Please wait before trying again.',
});

export const uploadLimiter = createLimiter({
  ...config.rateLimit.upload,
  message: 'Too many file uploads. Please try again later.',
});