import { Application } from '../models/Application.js';
import { Resume } from '../models/Resume.js';
import { Student } from '../models/Student.js';
import { Job } from '../models/Job.js';
import { Company } from '../models/Company.js';
import { auditService } from './audit.service.js';
import { notificationService } from './notification.service.js';
import { schedulerService } from './scheduler.service.js';

export class ApplicationService {
  async resolveStudentId(userId) {
    const student = await Student.findOne({ user: userId }).lean();
    return student ? student._id : userId;
  }

  async resolveUserId(studentId) {
    const student = await Student.findById(studentId).lean();
    return student ? student.user : studentId;
  }

  async apply(userId, jobId, resumeId, studentNotes, req) {
    const studentId = await this.resolveStudentId(userId);

    // If no resumeId provided, try to find the student's primary resume
    let finalResumeId = resumeId;
    if (!resumeId) {
      const primaryResume = await Resume.findOne({ student: studentId, isPrimary: true }).lean();
      if (primaryResume) {
        finalResumeId = primaryResume._id;
      }
    }

    if (!finalResumeId) {
      throw new Error('No resume found. Please upload a resume before applying.');
    }

    const application = await Application.create({
      student: studentId,
      studentId: studentId,
      job: jobId,
      jobId: jobId,
      resumeId: finalResumeId,
      studentNotes: studentNotes,
      status: 'APPLIED',
    });

    const job = await Job.findById(jobId).lean();

    // Trigger notification to student
    try {
      await notificationService.sendNotification({
        recipient: userId,
        type: 'APPLICATION_SUBMITTED',
        category: 'APPLICATION',
        priority: 'NORMAL',
        title: 'Application Submitted',
        message: `Your application for ${job?.title || 'the position'} has been successfully submitted.`,
        actionUrl: `/student/applications`,
        actionType: 'NAVIGATE',
        metadata: { applicationId: application._id, jobId },
      });
    } catch (err) {
      console.error('[Notification] Failed to send submission notification:', err.message);
    }

    if (req?.user) {
      await auditService.log({
        actor: req.user,
        action: 'APPLICATION_SUBMITTED',
        entity: 'Application',
        entityId: application._id,
        metadata: { action: 'APPLY' },
        req,
      });
    }

    return application.toObject();
  }

  async getStudentApplications(userId, options = {}) {
    const studentId = await this.resolveStudentId(userId);
    const { skip = 0, limit = 20 } = options;
    const filter = {
      $or: [{ student: studentId }, { studentId: studentId }],
    };

    const applications = await Application.find(filter)
      .populate('job')
      .populate('resumeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Application.countDocuments(filter);

    return { applications, total };
  }

  async verifyCompanyJobOwnership(user, jobId) {
    if (!user) throw new Error('Authentication required');
    if (['ADMIN', 'TPO'].includes(user.role)) return true;
    const company = await Company.findOne({ user: user._id }).lean();
    if (!company) {
      throw new Error('Company profile not found for this user');
    }
    const job = await Job.findById(jobId).lean();
    if (!job) {
      throw new Error('Job posting not found');
    }
    if (String(job.company) !== String(company._id)) {
      throw new Error('Unauthorized: You do not have access to candidate applications for another company job posting');
    }
    return true;
  }

  async verifyCompanyApplicationOwnership(user, applicationId) {
    if (!user) throw new Error('Authentication required');
    const application = await Application.findById(applicationId).populate('job').lean();
    if (!application) {
      throw new Error('Application not found');
    }
    if (['ADMIN', 'TPO'].includes(user.role)) return application;
    const company = await Company.findOne({ user: user._id }).lean();
    if (!company || String(application.job?.company) !== String(company._id)) {
      throw new Error('Unauthorized: You do not have access to manage applications belonging to another company');
    }
    return application;
  }

  async getJobApplications(jobId, options = {}, user) {
    if (user) {
      await this.verifyCompanyJobOwnership(user, jobId);
    }
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ job: jobId }, { jobId: jobId }],
    };

    const applications = await Application.find(filter)
      .populate('student')
      .populate('resumeId')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Application.countDocuments(filter);

    return { applications, total };
  }

  async updateStatus(applicationId, status, changedBy, notes, req) {
    if (req?.user) {
      await this.verifyCompanyApplicationOwnership(req.user, applicationId);
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: { status },
        $push: { statusHistory: { status, changedBy, notes, changedAt: new Date() } }
      },
      { new: true }
    ).populate('job');

    if (!application) {
      throw new Error('Application not found');
    }

    const targetUserId = await this.resolveUserId(application.student);

    // Send status notification
    try {
      let notifType = 'GENERAL';
      let notifTitle = `Application Status Updated: ${status}`;
      let notifPriority = 'NORMAL';

      if (status === 'SHORTLISTED') {
        notifType = 'APPLICATION_SHORTLISTED';
        notifTitle = 'Congratulations! You have been shortlisted';
        notifPriority = 'HIGH';
      } else if (status === 'REJECTED') {
        notifType = 'APPLICATION_REJECTED';
        notifTitle = 'Application Status Update';
      }

      await notificationService.sendNotification({
        recipient: targetUserId,
        type: notifType,
        category: 'APPLICATION',
        priority: notifPriority,
        title: notifTitle,
        message: `Your application for ${application.job?.title || 'the job'} status is now ${status}.`,
        actionUrl: `/student/applications`,
        actionType: 'NAVIGATE',
        metadata: { applicationId: application._id, status },
      });
    } catch (err) {
      console.error('[Notification] Failed to send status update notification:', err.message);
    }

    if (req?.user) {
      await auditService.log({
        actor: req.user,
        action: 'APPLICATION_STATUS_CHANGED',
        entity: 'Application',
        entityId: application._id,
        metadata: { action: 'STATUS_UPDATE', status },
        req,
      });
    }

    return application;
  }

  async addRecruiterNotes(applicationId, recruiterNotes, userId, req) {
    if (req?.user) {
      await this.verifyCompanyApplicationOwnership(req.user, applicationId);
    }
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { $set: { recruiterNotes } },
      { new: true }
    );
    if (!application) throw new Error('Application not found');
    return application;
  }

  async scheduleInterview(applicationId, details, req) {
    if (req?.user) {
      await this.verifyCompanyApplicationOwnership(req.user, applicationId);
    }
    const application = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: { status: 'INTERVIEW', interviewDetails: details },
        $push: { statusHistory: { status: 'INTERVIEW', changedBy: req?.user?._id, notes: 'Interview Scheduled', changedAt: new Date() } }
      },
      { new: true }
    ).populate('job');

    if (!application) throw new Error('Application not found');

    const targetUserId = await this.resolveUserId(application.student);

    // Immediate notification
    try {
      await notificationService.sendNotification({
        recipient: targetUserId,
        type: 'INTERVIEW_SCHEDULED',
        category: 'INTERVIEW',
        priority: 'HIGH',
        title: 'Interview Scheduled',
        message: `An interview has been scheduled for ${application.job?.title || 'your application'} on ${new Date(details.date || details.scheduledAt || Date.now()).toLocaleString()}.`,
        actionUrl: `/student/interviews`,
        actionType: 'NAVIGATE',
        metadata: { applicationId: application._id, details },
      });

      // Schedule automatic 24h, 1h, 15m reminders
      const scheduledTime = details.date || details.scheduledAt;
      if (scheduledTime) {
        await schedulerService.scheduleInterviewReminders(
          { _id: application._id, scheduledAt: scheduledTime, companyName: application.job?.title },
          targetUserId
        );
      }
    } catch (err) {
      console.error('[Notification] Interview notification failed:', err.message);
    }

    return application;
  }

  async extendOffer(applicationId, details, req) {
    if (req?.user) {
      await this.verifyCompanyApplicationOwnership(req.user, applicationId);
    }
    const application = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: { status: 'OFFERED', offerDetails: details },
        $push: { statusHistory: { status: 'OFFERED', changedBy: req?.user?._id, notes: 'Offer Extended', changedAt: new Date() } }
      },
      { new: true }
    ).populate('job');

    if (!application) throw new Error('Application not found');

    const targetUserId = await this.resolveUserId(application.student);

    try {
      await notificationService.sendNotification({
        recipient: targetUserId,
        type: 'OFFER_RECEIVED',
        category: 'APPLICATION',
        priority: 'CRITICAL',
        title: 'Job Offer Extended!',
        message: `Congratulations! An offer has been extended for ${application.job?.title || 'your job application'}.`,
        actionUrl: `/student/applications`,
        actionType: 'NAVIGATE',
        metadata: { applicationId: application._id, details },
      });
    } catch (err) {
      console.error('[Notification] Offer notification failed:', err.message);
    }

    return application;
  }
}

export const applicationService = new ApplicationService();