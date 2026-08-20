import { Router } from 'express';
import { atsService } from '../services/ats.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authenticate, isStudent } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// POST /api/v1/ats/analyze (student only)
export const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeId, targetJobId, customJobDescription, targetRole } = req.body;

  if (!resumeId) {
    return ApiResponse.badRequest(res, 'resumeId is required for ATS analysis');
  }

  const result = await atsService.analyzeResume(req.user._id, resumeId, {
    targetJobId,
    customJobDescription,
    targetRole,
  });

  ApiResponse.created(res, 'ATS Analysis completed successfully', result);
});

// GET /api/v1/ats/analyses (student only)
export const getMyAnalyses = asyncHandler(async (req, res) => {
  const analyses = await atsService.getAnalyses(req.user._id);
  ApiResponse.ok(res, 'ATS Analyses fetched', analyses);
});

// GET /api/v1/ats/history (student only)
export const getScoreHistory = asyncHandler(async (req, res) => {
  const analyses = await atsService.getAnalyses(req.user._id);
  const history = analyses.map((a) => ({
    id: a._id,
    version: a.resumeVersion,
    score: a.overallScore,
    targetRole: a.targetRole,
    date: a.createdAt,
  }));
  ApiResponse.ok(res, 'ATS Score History fetched', history);
});

// POST /api/v1/ats/compare (student only)
export const compareAnalyses = asyncHandler(async (req, res) => {
  const { analysisId1, analysisId2 } = req.body;
  const comparison = await atsService.compareAnalyses(req.user._id, analysisId1, analysisId2);
  ApiResponse.ok(res, 'ATS Version Comparison complete', comparison);
});

// GET /api/v1/ats/analyses/:id (student only)
export const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await atsService.getAnalysisById(req.user._id, req.params.id);
  ApiResponse.ok(res, 'ATS Analysis fetched', analysis);
});

// Route definitions (Specific FIRST before wildcard :id)
router.post('/analyze', isStudent, analyzeResume);
router.get('/analyses', isStudent, getMyAnalyses);
router.get('/history', isStudent, getScoreHistory);
router.post('/compare', isStudent, compareAnalyses);
router.get('/analyses/:id', isStudent, getAnalysisById);

export default router;
