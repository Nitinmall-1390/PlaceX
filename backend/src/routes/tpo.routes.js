import { Router } from 'express';
import { tpoService } from '../services/tpo.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authenticate, isTPOOrAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(isTPOOrAdmin);

// GET /api/v1/tpo/stats
export const getTPOStats = asyncHandler(async (req, res) => {
  const stats = await tpoService.getDashboardStats();
  ApiResponse.ok(res, 'TPO stats fetched', stats);
});

// GET /api/v1/tpo/students
export const getTPOStudents = asyncHandler(async (req, res) => {
  const result = await tpoService.getStudents(req.query);
  ApiResponse.ok(res, 'Students list fetched with eligibility metadata', result);
});

// GET /api/v1/tpo/analytics
export const getTPOAnalytics = asyncHandler(async (req, res) => {
  const stats = await tpoService.getDashboardStats();
  ApiResponse.ok(res, 'TPO placement analytics fetched', stats.analytics);
});

// GET /api/v1/tpo/forecast
export const getTPOForecast = asyncHandler(async (req, res) => {
  const { intelligenceService } = await import('../services/intelligence.service.js');
  const forecast = await intelligenceService.computePlacementForecast();
  ApiResponse.ok(res, 'Placement forecast fetched', forecast);
});

// GET /api/v1/tpo/at-risk
export const getTPOAtRisk = asyncHandler(async (req, res) => {
  const { intelligenceService } = await import('../services/intelligence.service.js');
  const atRisk = await intelligenceService.getAtRiskStudents(parseInt(req.query.limit, 10) || 20);
  ApiResponse.ok(res, 'At-risk students fetched', atRisk);
});

// GET /api/v1/tpo/skill-demand-gap
export const getTPOSkillGap = asyncHandler(async (req, res) => {
  const { intelligenceService } = await import('../services/intelligence.service.js');
  const skillGap = await intelligenceService.getSkillDemandGap();
  ApiResponse.ok(res, 'Skill demand gap analysis fetched', skillGap);
});

router.get('/stats', getTPOStats);
router.get('/students', getTPOStudents);
router.get('/analytics', getTPOAnalytics);
router.get('/forecast', getTPOForecast);
router.get('/at-risk', getTPOAtRisk);
router.get('/skill-demand-gap', getTPOSkillGap);

export default router;
