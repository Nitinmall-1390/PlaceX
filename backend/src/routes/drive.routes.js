import { Router } from 'express';
import { placementDriveService } from '../services/drive.service.js';
import { companyService } from '../services/company.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticate, isCompany, isAdmin, isStudent } from '../middlewares/auth.middleware.js';
import { driveFilterSchema, createDriveSchema } from '../validators/drive.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/drives
export const getDrives = asyncHandler(async (req, res) => {
  const { error, value } = driveFilterSchema.validate(req.query, { abortEarly: false });
  const filterParams = value || {};

  const { page = 1, limit = 20, sortBy = 'driveDate', sortOrder = 'desc', ...filters } = filterParams;
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const { drives, total } = await placementDriveService.getAllDrives(filters, { skip, limit, sort });

  ApiResponse.ok(res, 'Placement drives fetched', drives, {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: total || drives.length,
      totalPages: Math.ceil((total || drives.length) / limit),
    },
  });
});

// GET /api/v1/drives/me (company only)
export const getMyDrives = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const company = await companyService.getCompanyByRecruiter(req.user._id);
  const { drives, total } = await placementDriveService.getAllDrives({ company: company._id }, { skip, limit, sort: { driveDate: -1 } });

  ApiResponse.ok(res, 'Placement drives fetched', drives, {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: total || drives.length,
      totalPages: Math.ceil((total || drives.length) / limit),
    },
  });
});

// GET /api/v1/drives/:id
export const getDrive = asyncHandler(async (req, res) => {
  const drive = await placementDriveService.getDriveById(req.params.id);
  if (!drive) {
    throw ApiError.notFound('Placement drive not found');
  }
  ApiResponse.ok(res, 'Placement drive fetched', drive);
});

// POST /api/v1/drives (company only)
export const createDrive = asyncHandler(async (req, res) => {
  const { error, value } = createDriveSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const company = await companyService.getCompanyByRecruiter(req.user._id);
  const drive = await placementDriveService.createDrive(
    company._id,
    req.user._id,
    value,
  );

  ApiResponse.created(res, 'Placement drive created', drive);
});

// PATCH /api/v1/drives/:id (company owner only)
export const updateDrive = asyncHandler(async (req, res) => {
  const drive = await placementDriveService.updateDrive(
    req.params.id,
    req.body,
    req.user._id
  );

  ApiResponse.ok(res, 'Placement drive updated', drive);
});

// DELETE /api/v1/drives/:id (company owner only)
export const deleteDrive = asyncHandler(async (req, res) => {
  await placementDriveService.deleteDrive(req.params.id);
  ApiResponse.ok(res, 'Placement drive deleted');
});

// GET /api/v1/drives/:id/eligibility (student only)
export const checkDriveEligibility = asyncHandler(async (req, res) => {
  const result = await placementDriveService.checkEligibility(req.params.id, req.user._id);
  ApiResponse.ok(res, 'Eligibility check', result);
});

// Route definitions (Specific routes FIRST)
router.get('/', getDrives);
router.get('/me', isCompany, getMyDrives);
router.get('/:id', getDrive);
router.post('/', isCompany, createDrive);
router.patch('/:id', isCompany, updateDrive);
router.delete('/:id', isCompany, deleteDrive);
router.get('/:id/eligibility', isStudent, checkDriveEligibility);

export default router;
