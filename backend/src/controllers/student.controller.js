import { studentService } from '../services/student.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticate, isStudent, isAdmin } from '../middlewares/auth.middleware.js';
import { updateStudentProfileSchema } from '../validators/student.validator.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.getProfile(req.user._id);
  ApiResponse.ok(res, 'Profile fetched', profile);
});

// PATCH /api/v1/students/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { error, value } = updateStudentProfileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const profile = await studentService.updateProfile(req.user._id, value);
  ApiResponse.ok(res, 'Profile updated', profile);
});

// GET /api/v1/students/:id (admin only)
export const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getProfile(req.params.id);
  ApiResponse.ok(res, 'Student fetched', student);
});

// GET /api/v1/students (admin only)
export const getAllStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const { students, total } = await studentService.getAllStudents({}, { skip, limit });
  
  ApiResponse.ok(res, 'Students fetched', students, {
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/v1/students/me/stats
export const getMyStats = asyncHandler(async (req, res) => {
  const stats = await studentService.getStudentStats(req.user._id);
  ApiResponse.ok(res, 'Statistics fetched', stats);
});

// POST /api/v1/students (admin only)
export const createStudent = asyncHandler(async (req, res) => {
  const { error, value } = updateStudentProfileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const profile = await studentService.updateProfile(req.user._id, value);
  ApiResponse.ok(res, 'Student profile created', profile);
});
