import { resumeService } from '../services/resume.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticate, isStudent } from '../middlewares/auth.middleware.js';
import { uploadResume, requireCloudinary } from '../../middlewares/upload.middleware.js';
import { uploadLimiter } from '../middlewares/rateLimit.middleware.js';

export const uploadResumeController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const resume = await resumeService.uploadResume(req.user._id, req.file, req);
  ApiResponse.created(res, 'Resume uploaded successfully', resume);
});

// GET /api/v1/resumes (student only)
export const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getStudentResumes(req.user._id);
  ApiResponse.ok(res, 'Resumes fetched', resumes);
});

// DELETE /api/v1/resumes/:id (student only)
export const deleteResume = asyncHandler(async (req, res) => {
  const result = await resumeService.deleteResume(req.params.id, req.user._id);
  ApiResponse.ok(res, result.message);
});

// PATCH /api/v1/resumes/:id/primary (student only)
export const setPrimaryResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.setPrimary(req.params.id, req.user._id);
  ApiResponse.ok(res, 'Primary resume updated', resume);
});
