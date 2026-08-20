import { Job } from '../models/Job.js';
import { Student } from '../models/Student.js';
import { JOB_STATUS } from '../utils/constants.js';
import { notificationService } from './notification.service.js';
import { schedulerService } from './scheduler.service.js';

export class JobService {
  constructor() {
    this.model = Job;
  }

  async getPublishedJobs(filters = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    
    return this.model
      .find({
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: { $gt: new Date() },
        ...filters
      })
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }

  async getJobById(jobId) {
    return this.model.findById(jobId).lean();
  }

  async createJob(companyId, jobData, recruiterId) {
    const job = await this.model.create({
      company: companyId,
      title: jobData.title,
      description: jobData.description,
      skills: jobData.skills || [],
      preferredSkills: jobData.preferredSkills || [],
      eligibility: jobData.eligibility || {},
      location: jobData.location,
      employmentType: jobData.employmentType,
      compensation: jobData.compensation,
      openings: jobData.openings,
      applicationDeadline: jobData.applicationDeadline,
      status: JOB_STATUS.DRAFT,
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
      applicationCount: 0,
      shortlistCount: 0,
      selectedCount: 0,
    });
    return job.toObject();
  }

  async updateJob(id, updates, userId) {
    const job = await this.model.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // If job was published, notify eligible students & schedule deadline reminder
    if (updates.status === JOB_STATUS.PUBLISHED && job) {
      try {
        const students = await Student.find({ isEligible: true }).select('user').lean();
        const studentUserIds = students.map(s => s.user).filter(Boolean);

        for (const sUserId of studentUserIds.slice(0, 50)) { // notify top candidates
          await notificationService.sendNotification({
            recipient: sUserId,
            type: 'JOB_POSTED',
            category: 'JOB',
            priority: 'NORMAL',
            title: `New Job Opportunity: ${job.title}`,
            message: `A new position for ${job.title} has been posted. Apply before ${new Date(job.applicationDeadline).toLocaleDateString()}.`,
            actionUrl: `/student/jobs/${job._id}`,
            actionType: 'NAVIGATE',
            metadata: { jobId: job._id },
          });
        }

        // Schedule automatic deadline reminder
        if (job.applicationDeadline) {
          await schedulerService.scheduleJobDeadlineReminder(job, studentUserIds.slice(0, 50));
        }
      } catch (err) {
        console.error('[JobService] Notification dispatch failed:', err.message);
      }
    }

    return job;
  }

  async deleteJob(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  async submitForApproval(jobId, userId) {
    const job = await this.model.findByIdAndUpdate(
      jobId,
      { status: JOB_STATUS.PENDING_APPROVAL },
      { new: true }
    );
    return job;
  }

  async checkEligibility(jobId, studentId) {
    const job = await this.model.findById(jobId).lean();
    if (!job) throw new Error('Job not found');

    const { Student } = await import('./student.service.js').then(() => import('../models/Student.js'));
    const student = await Student.findOne(
      studentId ? { _id: studentId } : { user: studentId }
    ).lean();

    if (!student) return { eligible: false, reasons: ['Student profile not found'] };

    const reasons = [];
    const eligibility = job.eligibility || {};

    // CGPA check
    if (eligibility.minCGPA && (student.cgpa || 0) < eligibility.minCGPA) {
      reasons.push(`CGPA ${student.cgpa} is below minimum required ${eligibility.minCGPA}`);
    }

    // Department check
    if (eligibility.allowedDepartments && eligibility.allowedDepartments.length > 0) {
      const allowed = eligibility.allowedDepartments.map(d => d.toLowerCase());
      if (!allowed.includes((student.department || '').toLowerCase())) {
        reasons.push(`Department ${student.department} is not in allowed departments: ${eligibility.allowedDepartments.join(', ')}`);
      }
    }

    // Active backlogs check
    if (eligibility.maxBacklogs !== undefined && (student.activeBacklogs || 0) > eligibility.maxBacklogs) {
      reasons.push(`Active backlogs (${student.activeBacklogs}) exceed maximum allowed (${eligibility.maxBacklogs})`);
    }

    // Application deadline
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      reasons.push('Application deadline has passed');
    }

    return {
      eligible: reasons.length === 0,
      reasons,
      missingFields: [],
    };
  }
}

export const jobService = new JobService();