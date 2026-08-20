import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { ROLES } from '../utils/constants.js';
import { auditService } from './audit.service.js';

export class CompanyService {
  async getCompanyByRecruiter(recruiterId) {
    let company = await Company.findOne({ recruiter: recruiterId })
      .populate('recruiter', 'name email')
      .lean();

    if (!company) {
      const user = await User.findById(recruiterId);
      company = await Company.create({
        name: user?.name ? `${user.name} Solutions` : 'TechCorp Solutions',
        industry: 'Software & Technology',
        recruiter: recruiterId,
        isVerified: false,
      });
      company = company.toObject();
    }

    return company;
  }

  async updateCompany(companyId, updates, userId) {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!company) {
      throw new Error('Company not found');
    }

    await auditService.log({
      actor: { _id: userId, role: ROLES.COMPANY },
      action: 'ADMIN_ACTION',
      entity: 'Company',
      entityId: company._id,
      metadata: { action: 'UPDATE_PROFILE' },
    });

    return company;
  }

  async verifyCompany(companyId, isVerified, rejectionReason, adminId) {
    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        $set: {
          isVerified: isVerified,
          verifiedAt: isVerified ? new Date() : undefined,
          verifiedBy: isVerified ? adminId : undefined,
          rejectionReason: !isVerified ? rejectionReason : undefined,
        },
      },
      { new: true }
    ).lean();

    if (!company) {
      throw new Error('Company not found');
    }

    await auditService.log({
      actor: { _id: adminId, role: ROLES.ADMIN },
      action: isVerified ? 'COMPANY_APPROVED' : 'COMPANY_REJECTED',
      entity: 'Company',
      entityId: company._id,
      metadata: { rejectionReason },
    });

    return company;
  }

  async getAllCompanies(filters = {}, options = {}) {
    const { skip = 0, limit = 20 } = options;
    const companies = await Company.find(filters)
      .populate('recruiter', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Company.countDocuments(filters);

    return { companies, total };
  }

  async getPendingVerifications(options = {}) {
    return this.getAllCompanies({ isVerified: false }, options);
  }
}

export const companyService = new CompanyService();