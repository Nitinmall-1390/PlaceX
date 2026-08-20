import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../utils/constants.js';

/**
 * Restrict access to specific roles.
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'COMPANY')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  };
};

/**
 * Check if user is admin.
 */
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Admin access required');
  }
  next();
};

/**
 * Check if user is company/recruiter.
 */
export const isCompany = (req, res, next) => {
  if (req.user?.role !== ROLES.COMPANY) {
    throw ApiError.forbidden('Company access required');
  }
  next();
};

/**
 * Check if user is student.
 */
export const isStudent = (req, res, next) => {
  if (req.user?.role !== ROLES.STUDENT) {
    throw ApiError.forbidden('Student access required');
  }
  next();
};

/**
 * Check if user is TPO (Training & Placement Officer).
 */
export const isTPO = (req, res, next) => {
  if (req.user?.role !== ROLES.TPO) {
    throw ApiError.forbidden('TPO access required');
  }
  next();
};

/**
 * Check if user is TPO or Admin.
 */
export const isTPOOrAdmin = (req, res, next) => {
  if (![ROLES.TPO, ROLES.ADMIN].includes(req.user?.role)) {
    throw ApiError.forbidden('TPO or Admin access required');
  }
  next();
};

/**
 * Check if user is TPO, Company, or Admin.
 */
export const isTPOOrCompany = (req, res, next) => {
  if (![ROLES.TPO, ROLES.COMPANY, ROLES.ADMIN].includes(req.user?.role)) {
    throw ApiError.forbidden('TPO or Recruiter access required');
  }
  next();
};