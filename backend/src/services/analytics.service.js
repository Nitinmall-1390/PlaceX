import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { PlacementDrive } from '../models/PlacementDrive.js';
import { Student } from '../models/Student.js';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { JOB_STATUS, DRIVE_STATUS } from '../utils/constants.js';

export class AnalyticsService {
  // ─── Student Analytics ────────────────────────────────────────────────────
  async getStudentStats(studentId) {
    const student = await Student.findOne({ user: studentId }).lean();
    if (!student) {
      throw new Error('Student not found');
    }

    const applications = await Application.find({ student: studentId }).lean();

    return {
      studentProfile: {
        skills: student.skills || [],
        certifications: student.certifications || [],
        profileCompletion: student.profileCompletion || 0,
      },
      applicationStats: {
        total: applications.length,
        byStatus: applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {}),
        interviews: applications.filter(a => a.status === 'INTERVIEW').length,
        shortlists: applications.filter(a => ['SHORTLISTED', 'SELECTED'].includes(a.status)).length,
        placements: applications.filter(a => a.status === 'OFFERED').length,
      },
    };
  }

  // Alias for controller compatibility
  async getStudentAnalytics(studentId) {
    return this.getStudentStats(studentId);
  }

  // ─── Company Analytics ────────────────────────────────────────────────────
  async getCompanyStats(companyId) {
    const company = await Company.findById(companyId).lean();
    if (!company) {
      throw new Error('Company not found');
    }

    const jobs = await Job.find({ company: companyId }).lean();
    const publishedJobs = jobs.filter(j => j.status === JOB_STATUS.PUBLISHED);
    const totalApplications = await Application.countDocuments({
      job: { $in: jobs.map(j => j._id) },
    });

    return {
      totalJobs: jobs.length,
      publishedJobs: publishedJobs.length,
      totalApplications,
      topSkills: await this.getTopSkills(companyId),
    };
  }

  // Alias for controller compatibility
  async getCompanyAnalytics(companyId) {
    return this.getCompanyStats(companyId);
  }

  // ─── Admin Analytics ──────────────────────────────────────────────────────
  async getAnalytics() {
    const [totalStudents, totalCompanies, totalJobs, totalDrives, totalApplications] =
      await Promise.all([
        Student.countDocuments(),
        Company.countDocuments({ isVerified: true }),
        Job.countDocuments({ status: JOB_STATUS.PUBLISHED }),
        PlacementDrive.countDocuments({ status: { $in: [DRIVE_STATUS.SCHEDULED, DRIVE_STATUS.ONGOING] } }),
        Application.countDocuments(),
      ]);

    const placedStudents = await Application.countDocuments({ status: 'OFFERED' });
    const successRate = totalApplications > 0
      ? Math.round((placedStudents / totalApplications) * 100)
      : 0;

    return {
      totalStudents,
      totalCompanies,
      totalJobs,
      totalDrives,
      totalApplications,
      placedStudents,
      successRate,
    };
  }

  // Alias for controller compatibility
  async getAdminStats() {
    return this.getAnalytics();
  }

  // ─── Application Funnel ───────────────────────────────────────────────────
  async getApplicationFunnel() {
    const statuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'OFFERED', 'REJECTED'];
    const funnel = {};

    for (const status of statuses) {
      funnel[status] = await Application.countDocuments({ status });
    }

    return { funnel };
  }

  // ─── Department Stats ─────────────────────────────────────────────────────
  async getDepartmentStats() {
    const stats = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return stats.map(s => ({ department: s._id, count: s.count }));
  }

  // ─── Drive Stats ──────────────────────────────────────────────────────────
  async getDriveStats(driveId) {
    const drive = await PlacementDrive.findById(driveId).lean();
    if (!drive) {
      throw new Error('Placement drive not found');
    }

    return {
      driveTitle: drive.title,
      driveDate: drive.driveDate,
      status: drive.status,
      participantCount: drive.participants?.length || 0,
    };
  }

  // ─── Top Skills ───────────────────────────────────────────────────────────
  async getTopSkills(companyId) {
    const jobs = await Job.find({
      company: companyId,
      status: JOB_STATUS.PUBLISHED,
    }).lean();

    const skillCounts = {};
    jobs.forEach(job => {
      (job.skills || []).forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  }
}

export const analyticsService = new AnalyticsService();
