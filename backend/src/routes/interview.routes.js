import { Router } from 'express';
import { interviewService } from '../services/interview.service.js';
import { companyService } from '../services/company.service.js';
import { studentService } from '../services/student.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authenticate, isStudent, isCompany, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/interviews/me (student only)
export const getMyStudentInterviews = asyncHandler(async (req, res) => {
  const student = await studentService.getProfile(req.user._id);
  const interviews = await interviewService.getStudentInterviews(student._id);
  ApiResponse.ok(res, 'Student interviews fetched', interviews);
});

// GET /api/v1/interviews/company (company only)
export const getMyCompanyInterviews = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyByRecruiter(req.user._id);
  const interviews = await interviewService.getCompanyInterviews(company._id);
  ApiResponse.ok(res, 'Company interviews fetched', interviews);
});

// GET /api/v1/interviews (admin only)
export const getAllInterviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const { interviews, total } = await interviewService.getAllInterviews({}, { skip, limit });
  ApiResponse.ok(res, 'All interviews fetched', interviews, {
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
  });
});

// POST /api/v1/interviews (company only)
export const scheduleInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.scheduleInterview(req.body, req);
  ApiResponse.created(res, 'Interview scheduled successfully', interview);
});

// PATCH /api/v1/interviews/:id/status
export const updateInterviewStatus = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;
  const interview = await interviewService.updateInterviewStatus(req.params.id, status, feedback, req);
  ApiResponse.ok(res, 'Interview status updated', interview);
});

router.get('/me', isStudent, getMyStudentInterviews);
router.get('/company', isCompany, getMyCompanyInterviews);
router.get('/', isAdmin, getAllInterviews);
router.post('/', isCompany, scheduleInterview);
router.patch('/:id/status', updateInterviewStatus);

export default router;
