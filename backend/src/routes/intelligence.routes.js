import { Router } from 'express';
import { intelligenceService } from '../services/intelligence.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticate, isStudent, isCompany, isTPOOrAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/intelligence/readiness
 * Compute and return PX Readiness Index for the logged-in student.
 */
router.get('/readiness', isStudent, asyncHandler(async (req, res) => {
  const result = await intelligenceService.computeReadinessIndex(req.user._id);
  ApiResponse.ok(res, 'PX Readiness Index computed', result);
}));

/**
 * POST /api/v1/intelligence/snapshot
 * Force a readiness index snapshot (student or admin).
 */
router.post('/snapshot', isStudent, asyncHandler(async (req, res) => {
  const result = await intelligenceService.computeReadinessIndex(req.user._id);
  ApiResponse.ok(res, 'Readiness snapshot saved', { overallScore: result.overallScore, snapshotAt: result.dataTimestamp });
}));

/**
 * POST /api/v1/intelligence/job-match
 * Compute match score for a student vs a specific job.
 * Students see their own match; company/TPO/admin can pass studentUserId.
 */
router.post('/job-match', asyncHandler(async (req, res) => {
  const { jobId, studentUserId } = req.body;
  if (!jobId) throw ApiError.badRequest('jobId is required');
  const userId = studentUserId && ['ADMIN', 'TPO', 'COMPANY'].includes(req.user.role)
    ? studentUserId
    : req.user._id;
  const result = await intelligenceService.computeJobMatch(userId, jobId);
  ApiResponse.ok(res, 'Job match score computed', result);
}));

/**
 * GET /api/v1/intelligence/job-recommendations
 * Get top N job recommendations for the logged-in student.
 */
router.get('/job-recommendations', isStudent, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
  const result = await intelligenceService.computeJobRecommendations(req.user._id, limit);
  ApiResponse.ok(res, 'Job recommendations computed', result);
}));

/**
 * POST /api/v1/intelligence/candidate-ranking
 * Get AI-ranked candidates for a job. Company/TPO/Admin only.
 * Scores are NOT exposed to students.
 */
router.post('/candidate-ranking', asyncHandler(async (req, res) => {
  if (!['COMPANY', 'TPO', 'ADMIN'].includes(req.user.role)) {
    throw ApiError.forbidden('Candidate ranking is only available to recruiters, TPO, and admins');
  }
  const { jobId } = req.body;
  if (!jobId) throw ApiError.badRequest('jobId is required');
  const result = await intelligenceService.computeCandidateRanking(jobId);
  ApiResponse.ok(res, 'Candidate ranking computed', result);
}));

/**
 * GET /api/v1/intelligence/skill-gap
 * Compute skill gap for logged-in student vs market demand.
 */
router.get('/skill-gap', isStudent, asyncHandler(async (req, res) => {
  const { targetJobId } = req.query;
  const result = await intelligenceService.computeSkillGap(req.user._id, targetJobId || null);
  ApiResponse.ok(res, 'Skill gap analysis complete', result);
}));

/**
 * GET /api/v1/intelligence/learning-plan
 * Get personalized 7-day learning plan for logged-in student.
 */
router.get('/learning-plan', isStudent, asyncHandler(async (req, res) => {
  const result = await intelligenceService.generateLearningPlan(req.user._id);
  ApiResponse.ok(res, 'Learning plan generated', result);
}));

/**
 * GET /api/v1/intelligence/tpo-forecast
 * Placement forecast and at-risk analysis for TPO/Admin.
 */
router.get('/tpo-forecast', isTPOOrAdmin, asyncHandler(async (req, res) => {
  const [forecast, atRisk, skillGap] = await Promise.all([
    intelligenceService.computePlacementForecast(),
    intelligenceService.getAtRiskStudents(20),
    intelligenceService.getSkillDemandGap(),
  ]);
  ApiResponse.ok(res, 'Placement forecast computed', { forecast, atRisk, skillDemandGap: skillGap });
}));

/**
 * GET /api/v1/intelligence/skill-demand-gap
 * Market skill demand gap analysis for TPO/Admin.
 */
router.get('/skill-demand-gap', isTPOOrAdmin, asyncHandler(async (req, res) => {
  const result = await intelligenceService.getSkillDemandGap();
  ApiResponse.ok(res, 'Skill demand gap computed', result);
}));

/**
 * GET /api/v1/intelligence/at-risk-students
 * List students at risk of not being placed, for TPO/Admin.
 */
router.get('/at-risk-students', isTPOOrAdmin, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const result = await intelligenceService.getAtRiskStudents(limit);
  ApiResponse.ok(res, 'At-risk students computed', result);
}));

export default router;
