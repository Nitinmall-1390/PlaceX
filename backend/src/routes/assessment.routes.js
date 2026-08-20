import { Router } from 'express';
import { assessmentService } from '../services/assessment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authenticate, isStudent, isTPOOrCompany } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// POST /api/v1/assessments (TPO, Company, Admin)
export const createAssessment = asyncHandler(async (req, res) => {
  const result = await assessmentService.createAssessment(req.user._id, req.user.role, req.body);
  ApiResponse.created(res, 'Assessment created successfully', result);
});

// GET /api/v1/assessments (All authenticated users)
export const getAssessments = asyncHandler(async (req, res) => {
  const result = await assessmentService.getAssessments(req.user._id, req.user.role);
  ApiResponse.ok(res, 'Assessments fetched', result);
});

// GET /api/v1/assessments/:id
export const getAssessmentById = asyncHandler(async (req, res) => {
  const result = await assessmentService.getAssessmentById(req.user._id, req.user.role, req.params.id);
  ApiResponse.ok(res, 'Assessment fetched', result);
});

// POST /api/v1/assessments/:id/start (Student)
export const startAttempt = asyncHandler(async (req, res) => {
  const result = await assessmentService.startAttempt(req.user._id, req.params.id);
  ApiResponse.ok(res, 'Assessment attempt started', result);
});

// PATCH /api/v1/assessments/:id/autosave (Student)
export const autosaveAttempt = asyncHandler(async (req, res) => {
  const result = await assessmentService.autosaveAttempt(req.user._id, req.params.id, req.body);
  ApiResponse.ok(res, 'Attempt autosaved', result);
});

// POST /api/v1/assessments/:id/run (Student)
export const runCode = asyncHandler(async (req, res) => {
  const result = await assessmentService.runCode(req.user._id, req.params.id, req.body);
  ApiResponse.ok(res, 'Code executed against visible test cases', result);
});

// POST /api/v1/assessments/:id/submit (Student)
export const submitAssessment = asyncHandler(async (req, res) => {
  try {
    const result = await assessmentService.submitAssessment(req.user._id, req.params.id, req.body);
    ApiResponse.ok(res, 'Assessment submitted successfully', result);
  } catch (err) {
    console.error('CRITICAL SUBMIT ERROR:', err);
    throw err;
  }
});

// GET /api/v1/assessments/:id/result (Student)
export const getAttemptResult = asyncHandler(async (req, res) => {
  const result = await assessmentService.getAttemptResult(req.user._id, req.params.id);
  ApiResponse.ok(res, 'Assessment result fetched', result);
});

// GET /api/v1/assessments/:id/candidates (TPO, Company, Admin)
export const getAssessmentCandidates = asyncHandler(async (req, res) => {
  const result = await assessmentService.getAssessmentCandidates(req.params.id);
  ApiResponse.ok(res, 'Candidate results fetched', result);
});

// Route mounting
router.post('/', isTPOOrCompany, createAssessment);
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.post('/:id/start', isStudent, startAttempt);
router.patch('/:id/autosave', isStudent, autosaveAttempt);
router.post('/:id/run', isStudent, runCode);
router.post('/:id/submit', isStudent, submitAssessment);
router.get('/:id/result', isStudent, getAttemptResult);
router.get('/:id/candidates', isTPOOrCompany, getAssessmentCandidates);

export default router;
