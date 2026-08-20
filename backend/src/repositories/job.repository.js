import { BaseRepository } from './base.repository.js';
import { JOB_STATUS } from '../utils/constants.js';
import { Job } from '../models/Job.js';

export class JobRepository extends BaseRepository {
  constructor() {
    super(Job);
  }

  async findPublished(options = {}) {
    const now = new Date();
    return this.findMany(
      {
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: { $gt: now },
      },
      options
    );
  }

  async findByCompany(companyId, options = {}) {
    return this.findMany({ company: companyId }, options);
  }

  async search(query = {}, options = {}) {
    const filter = {
      status: JOB_STATUS.PUBLISHED,
      ...query,
    };
    return this.findMany(filter, options);
  }
}

export const jobRepository = new JobRepository();