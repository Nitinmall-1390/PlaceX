import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { isStudent, isCompany, isAdmin, isTPO, isTPOOrAdmin, isTPOOrCompany } from './rbac.middleware.js';

export { isStudent, isCompany, isAdmin, isTPO, isTPOOrAdmin, isTPOOrCompany };
export const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  
  // Try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // Fallback to cookie
  if (!token) {
    token = req.cookies?.['placex_at'];
  }
  
  if (!token) {
    throw ApiError.unauthorized('No token provided');
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.id).select('-passwordHash -passwordResetOtp');
    
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }
    
    if (!user.isActive || user.isSuspended) {
      throw ApiError.forbidden('Account is suspended or deactivated');
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired');
    }
    throw error;
  }
});