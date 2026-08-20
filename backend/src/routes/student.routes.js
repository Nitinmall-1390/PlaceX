import { Router } from 'express';
import { studentService } from '../services/student.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authenticate, isStudent, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/students/me
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.getProfile(req.user._id);
  ApiResponse.ok(res, 'Profile fetched', profile);
});

// PATCH /api/v1/students/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.updateProfile(req.user._id, req.body);
  ApiResponse.ok(res, 'Profile updated', profile);
});

// GET /api/v1/students/me/strength
export const getMyStrength = asyncHandler(async (req, res) => {
  const strength = await studentService.getProfileStrength(req.user._id);
  ApiResponse.ok(res, 'Profile strength fetched', strength);
});

// GET /api/v1/students/me/activity
export const getMyActivity = asyncHandler(async (req, res) => {
  const activity = await studentService.getProfileActivity(req.user._id);
  ApiResponse.ok(res, 'Profile activity fetched', activity);
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

// Route definitions (Specific routes FIRST before wildcard :id)
router.get('/me', isStudent, getMyProfile);
router.patch('/me', isStudent, updateMyProfile);
router.get('/me/strength', isStudent, getMyStrength);
router.get('/me/activity', isStudent, getMyActivity);
router.get('/', isAdmin, getAllStudents);
router.get('/:id', isAdmin, getStudentById);

export default router;
