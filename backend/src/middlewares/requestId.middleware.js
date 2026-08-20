import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

export const requestIdMiddleware = asyncHandler(async (req, res, next) => {
  // Generate or use existing request ID
  req.id = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  res.setHeader('x-request-id', req.id);

  next();
});
