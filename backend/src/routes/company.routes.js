import { Router } from 'express';
import { companyService } from '../services/company.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { authenticate, isAdmin, isCompany } from '../middlewares/auth.middleware.js';
import { updateCompanyProfileSchema, verifyCompanySchema } from '../validators/company.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/companies/me
export const getMyCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyByRecruiter(req.user._id);
  ApiResponse.ok(res, 'Company profile fetched', company);
});

// PATCH /api/v1/companies/me
export const updateMyCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyByRecruiter(req.user._id);
  
  const updated = await companyService.updateCompany(
    company._id,
    req.body,
    req.user._id
  );

  ApiResponse.ok(res, 'Company profile updated', updated);
});

// GET /api/v1/companies (admin only)
export const getAllCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const { companies, total } = await companyService.getAllCompanies({}, { skip, limit });
  
  ApiResponse.ok(res, 'Companies fetched', companies, {
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/v1/companies/pending (admin only)
export const getPendingCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const { companies, total } = await companyService.getPendingVerifications({ skip, limit });
  
  ApiResponse.ok(res, 'Pending companies fetched', companies, {
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// PATCH /api/v1/companies/:id/verify (admin only)
export const verifyCompany = asyncHandler(async (req, res) => {
  const { error, value } = verifyCompanySchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw ApiError.validation(error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
  }

  const company = await companyService.verifyCompany(
    req.params.id,
    value.isVerified,
    value.rejectionReason,
    req.user._id
  );

  ApiResponse.ok(res, `Company ${value.isVerified ? 'approved' : 'rejected'}`, company);
});

// Route definitions
router.get('/me', isCompany, getMyCompany);
router.patch('/me', isCompany, updateMyCompany);
router.get('/', isAdmin, getAllCompanies);
router.get('/pending', isAdmin, getPendingCompanies);
router.patch('/:id/verify', isAdmin, verifyCompany);

export default router;
