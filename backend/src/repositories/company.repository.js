import { BaseRepository } from './base.repository.js';
import { Company } from '../models/Company.js';

export class CompanyRepository extends BaseRepository {
  constructor() {
    super(Company);
  }

  async findByRecruiterId(recruiterId) {
    return this.findOne({ recruiter: recruiterId });
  }

  async findVerified(options = {}) {
    return this.findMany({ isVerified: true }, options);
  }

  async findPendingVerification(options = {}) {
    return this.findMany({ isVerified: false }, options);
  }
}

export const companyRepository = new CompanyRepository();