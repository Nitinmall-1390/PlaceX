import { Router } from 'express';
import { applicationService } from '../services/application.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { applySchema, updateApplicationStatusSchema, recruiterNotesSchema, interviewScheduleSchema, offerDetailsSchema } from '../validators/application.validator.js';
import { authenticate, isStudent, isCompany, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/applications
export const applyToJob = asyncHandler(async (req, res) => {
  const { error, value } = applySchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const application = await applicationService.apply(
    req.user._id,
    value.jobId,
    value.resumeId,
    value.studentNotes,
    req
  );

  ApiResponse.created(res, 'Application submitted successfully', application);
});

// GET /api/v1/applications/me (student only)
export const getMyApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const { applications, total } = await applicationService.getStudentApplications(
    req.user._id,
    { skip, limit }
  );

  ApiResponse.ok(res, 'Applications fetched', applications, {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  });
});

// GET /api/v1/jobs/:jobId/applications (company only)
export const getJobApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const { applications, total } = await applicationService.getJobApplications(
    req.params.jobId,
    { page: Number(page), limit: Number(limit) },
    req.user
  );
  
  ApiResponse.ok(res, 'Applications fetched', applications, {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  });
});

// PATCH /api/v1/applications/:id/status (company only)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { error, value } = updateApplicationStatusSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const application = await applicationService.updateStatus(
    req.params.id,
    value.status,
    req.user._id,
    value.notes,
    req
  );

  ApiResponse.ok(res, 'Application status updated', application);
});

// PATCH /api/v1/applications/:id/notes (company only)
export const addRecruiterNotes = asyncHandler(async (req, res) => {
  const { error, value } = recruiterNotesSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const application = await applicationService.addRecruiterNotes(
    req.params.id,
    value.recruiterNotes,
    req.user._id,
    req
  );

  ApiResponse.ok(res, 'Recruiter notes added', application);
});

// PATCH /api/v1/applications/:id/schedule-interview (company only)
export const scheduleInterview = asyncHandler(async (req, res) => {
  const { error, value } = interviewScheduleSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const application = await applicationService.scheduleInterview(req.params.id, value, req);
  ApiResponse.ok(res, 'Interview scheduled', application);
});

// PATCH /api/v1/applications/:id/offer (company only)
export const extendOffer = asyncHandler(async (req, res) => {
  const { error, value } = offerDetailsSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const application = await applicationService.extendOffer(req.params.id, value, req);
  ApiResponse.ok(res, 'Offer extended', application);
});

// Route definitions
router.post('/', isStudent, applyToJob);
router.get('/me', isStudent, getMyApplications);
router.get('/jobs/:jobId/applications', isCompany, getJobApplications);
router.patch('/:id/status', isCompany, updateApplicationStatus);
router.patch('/:id/notes', isCompany, addRecruiterNotes);
router.patch('/:id/schedule-interview', isCompany, scheduleInterview);
router.patch('/:id/offer', isCompany, extendOffer);

export default router;
