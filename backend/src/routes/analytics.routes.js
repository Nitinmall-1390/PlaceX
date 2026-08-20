import { Router } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { companyService } from '../services/company.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticate, isStudent, isCompany, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/analytics/me (student only)
export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const result = await analyticsService.getStudentStats(req.user._id);
  ApiResponse.ok(res, 'Student analytics', result);
});

// GET /api/v1/analytics/company/stats (company only)
export const getCompanyAnalytics = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyByRecruiter(req.user._id);
  const result = await analyticsService.getCompanyStats(company._id);
  ApiResponse.ok(res, 'Company analytics', result);
});

// GET /api/v1/analytics/drive/:driveId/stats (student only)
export const getDriveStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDriveStats(req.params.driveId);
  ApiResponse.ok(res, 'Placement drive stats', stats);
});

// GET /api/v1/analytics (admin only)
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const result = await analyticsService.getAnalytics();
  ApiResponse.ok(res, 'Analytics data', result);
});

// Route definitions
router.get('/me', isStudent, getStudentAnalytics);
router.get('/company/stats', isCompany, getCompanyAnalytics);
router.get('/drive/:driveId/stats', isStudent, getDriveStats);
router.get('/', isAdmin, getAdminAnalytics);

export default router;
