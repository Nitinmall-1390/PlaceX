import { Router } from 'express';
import { jobService } from '../services/job.service.js';
import { companyService } from '../services/company.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticate, isCompany, isAdmin, isStudent } from '../middlewares/auth.middleware.js';
import { jobFilterSchema, createJobSchema } from '../validators/job.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/jobs
export const getJobs = asyncHandler(async (req, res) => {
  const { error, value } = jobFilterSchema.validate(req.query, { abortEarly: false });
  const filterParams = value || {};

  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = filterParams;
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const jobs = await jobService.getPublishedJobs(filters, { skip, limit, sort });

  ApiResponse.ok(res, 'Jobs fetched', jobs, {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: jobs.length,
      totalPages: Math.ceil(jobs.length / limit),
    },
  });
});

// GET /api/v1/jobs/me (company only)
export const getMyJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const company = await companyService.getCompanyByRecruiter(req.user._id);
  const jobs = await jobService.getPublishedJobs({ company: company._id }, { skip, limit, sort: { createdAt: -1 } });

  ApiResponse.ok(res, 'Jobs fetched', jobs, {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: jobs.length,
      totalPages: Math.ceil(jobs.length / limit),
    },
  });
});

// GET /api/v1/jobs/:id
export const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  if (!job) {
    throw ApiError.notFound('Job posting not found');
  }
  ApiResponse.ok(res, 'Job fetched', job);
});

// POST /api/v1/jobs (company only)
export const createJob = asyncHandler(async (req, res) => {
  const { error, value } = createJobSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const company = await companyService.getCompanyByRecruiter(req.user._id);
  const job = await jobService.createJob(company._id, value, req.user._id);
  ApiResponse.created(res, 'Job created successfully', job);
});

// PATCH /api/v1/jobs/:id (company owner only)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.body, req.user._id);
  ApiResponse.ok(res, 'Job updated', job);
});

// POST /api/v1/jobs/:id/submit (company only)
export const submitJobForApproval = asyncHandler(async (req, res) => {
  const job = await jobService.submitForApproval(req.params.id, req.user._id);
  ApiResponse.created(res, 'Job submitted for approval', job);
});

// DELETE /api/v1/jobs/:id (company owner only)
export const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.params.id);
  ApiResponse.ok(res, 'Job deleted');
});

// GET /api/v1/jobs/:id/eligibility (student only)
export const checkJobEligibility = asyncHandler(async (req, res) => {
  const result = await jobService.checkEligibility(req.params.id, req.user._id);
  ApiResponse.ok(res, 'Eligibility check', result);
});

// Route definitions (Specific routes FIRST before wildcard :id)
router.get('/', getJobs);
router.get('/me', isCompany, getMyJobs);
router.get('/:id', getJob);
router.post('/', isCompany, createJob);
router.patch('/:id', isCompany, updateJob);
router.post('/:id/submit', isCompany, submitJobForApproval);
router.delete('/:id', isCompany, deleteJob);
router.get('/:id/eligibility', isStudent, checkJobEligibility);

export default router;
