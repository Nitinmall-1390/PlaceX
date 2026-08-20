import { analyticsService } from '../services/analytics.service.js';
import { companyService } from '../services/company.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticate, isAdmin, isStudent, isCompany } from '../middlewares/auth.middleware.js';

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getAdminStats();
  ApiResponse.ok(res, 'Admin analytics fetched', stats);
});

// GET /api/v1/analytics/student (student only)
export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getStudentAnalytics(req.user._id);
  ApiResponse.ok(res, 'Student analytics fetched', stats);
});

// GET /api/v1/analytics/company (company only)
export const getCompanyAnalytics = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyByRecruiter(req.user._id);
  const stats = await analyticsService.getCompanyAnalytics(company._id);
  ApiResponse.ok(res, 'Company analytics fetched', stats);
});

// GET /api/v1/analytics/jobs (company only)
export const getJobAnalytics = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyByRecruiter(req.user._id);
  const stats = await analyticsService.getCompanyAnalytics(company._id);
  ApiResponse.ok(res, 'Company analytics fetched', stats);
});

// GET /api/v1/analytics/applications (admin only)
export const getApplicationAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getApplicationFunnel();
  ApiResponse.ok(res, 'Application analytics', analytics);
});

// GET /api/v1/analytics/departments (admin only)
export const getDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDepartmentStats();
  ApiResponse.ok(res, 'Department statistics', stats);
});