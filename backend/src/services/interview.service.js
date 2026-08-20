import { Interview } from '../models/Interview.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { applicationService } from './application.service.js';
import { auditService } from './audit.service.js';

export class InterviewService {
  async getStudentInterviews(studentId) {
    return Interview.find({ student: studentId })
      .populate('company', 'name industry logoUrl')
      .populate('job', 'title location employmentType compensation')
      .sort({ scheduledAt: 1 })
      .lean();
  }

  async getCompanyInterviews(companyId) {
    return Interview.find({ company: companyId })
      .populate({
        path: 'student',
        populate: { path: 'userProfile', select: 'name email' },
      })
      .populate('job', 'title')
      .sort({ scheduledAt: 1 })
      .lean();
  }

  async getAllInterviews(filters = {}, options = {}) {
    const { skip = 0, limit = 20 } = options;
    const interviews = await Interview.find(filters)
      .populate({
        path: 'student',
        populate: { path: 'userProfile', select: 'name email' },
      })
      .populate('company', 'name')
      .populate('job', 'title')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Interview.countDocuments(filters);
    return { interviews, total };
  }

  async scheduleInterview(data, req = null) {
    const { applicationId, studentId, companyId, jobId, scheduledAt, type, meetingLink, interviewer, location } = data;

    // Resolve student/company/job from application if not provided
    let resolvedStudentId = studentId;
    let resolvedCompanyId = companyId;
    let resolvedJobId = jobId;

    if (applicationId) {
      const application = await Application.findById(applicationId).lean();
      if (application) {
        if (!resolvedStudentId) resolvedStudentId = application.student || application.studentId;
        if (!resolvedJobId) resolvedJobId = application.job || application.jobId;
      }
    }

    // Resolve company from job if still not available
    if (!resolvedCompanyId && resolvedJobId) {
      const job = await Job.findById(resolvedJobId).lean();
      if (job) {
        resolvedCompanyId = job.company;
      }
    }

    if (!resolvedStudentId || !resolvedCompanyId || !resolvedJobId) {
      throw new Error('studentId, companyId, and jobId are required');
    }

    const interview = await Interview.create({
      application: applicationId,
      student: resolvedStudentId,
      company: resolvedCompanyId,
      job: resolvedJobId,
      scheduledAt: scheduledAt || new Date(Date.now() + 86400000 * 2),
      type: type || 'TECHNICAL',
      meetingLink: meetingLink || 'https://meet.google.com/px-interview-room',
      location: location || 'Online / Remote',
      interviewer: interviewer || { name: 'Senior Interviewer', email: 'interviews@placex.com' },
      status: 'SCHEDULED',
    });

    if (applicationId) {
      await applicationService.updateStatus(applicationId, 'INTERVIEW', req?.user?._id, 'Interview scheduled');
    }

    if (req?.user) {
      await auditService.log({
        actor: req.user,
        action: 'INTERVIEW_SCHEDULED',
        entity: 'Interview',
        entityId: interview._id,
        metadata: { scheduledAt, type },
        req,
      });
    }

    return interview.toObject();
  }

  async updateInterviewStatus(interviewId, status, feedback, req = null) {
    const interview = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: { status, feedback } },
      { new: true }
    );

    if (!interview) {
      throw new Error('Interview not found');
    }

    return interview.toObject();
  }
}

export const interviewService = new InterviewService();
