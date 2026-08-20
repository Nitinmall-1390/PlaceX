import { BaseRepository } from './base.repository.js';
import { Application } from '../models/Application.js';

export class ApplicationRepository extends BaseRepository {
  constructor() {
    super(Application);
  }

  async findByStudent(studentId, options = {}) {
    return this.findMany({ student: studentId }, options);
  }

  async findByJob(jobId, options = {}) {
    return this.findMany({ job: jobId }, options);
  }

  async findOneApplication(studentId, jobId) {
    return this.findOne({ student: studentId, job: jobId });
  }

  async findWithDetails(applicationId) {
    return this.model
      .findById(applicationId)
      .populate('student', 'studentId department course graduationYear cgpa skills')
      .populate('job', 'title company location employmentType compensation')
      .populate('resume', 'fileUrl fileName atsScore')
      .lean();
  }

  async updateStatus(applicationId, status, changedBy, notes) {
    return this.model.findByIdAndUpdate(
      applicationId,
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            changedBy,
            notes,
            changedAt: new Date(),
          },
        },
      },
      { new: true }
    );
  }
}

export const applicationRepository = new ApplicationRepository();