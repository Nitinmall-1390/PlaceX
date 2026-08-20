import { Student } from '../models/Student.js';
import { Company } from '../models/Company.js';
import { Job } from '../models/Job.js';
import { PlacementDrive } from '../models/PlacementDrive.js';
import { Application } from '../models/Application.js';
import { Assessment } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';

export class TPOService {
  /**
   * TPO Dashboard Aggregated Analytics.
   */
  async getDashboardStats() {
    const [
      totalStudents,
      placedStudentsCount,
      activeDrivesCount,
      companiesCount,
      openJobsCount,
      upcomingAssessmentsCount,
      applications,
      studentsList,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ placementStatus: { $in: ['PLACED', 'OFFER_RECEIVED'] } }),
      PlacementDrive.countDocuments({ status: { $in: ['SCHEDULED', 'ONGOING'] } }),
      Company.countDocuments({ isVerified: true }),
      Job.countDocuments({ status: 'PUBLISHED' }),
      Assessment.countDocuments({ status: 'PUBLISHED' }),
      Application.find().lean(),
      Student.find().lean(),
    ]);

    const eligibleStudentsCount = studentsList.filter(s => (s.cgpa || 0) >= 7.0).length;

    // Recruitment Pipeline Breakdown
    const pipeline = {
      APPLIED: applications.length,
      SCREENING: applications.filter(a => a.status === 'UNDER_REVIEW').length,
      SHORTLISTED: applications.filter(a => a.status === 'SHORTLISTED').length,
      CODING_ROUND: applications.filter(a => a.status === 'SHORTLISTED').length,
      TECHNICAL_INTERVIEW: applications.filter(a => a.status === 'INTERVIEW').length,
      HR_INTERVIEW: applications.filter(a => a.status === 'SELECTED').length,
      OFFER: applications.filter(a => a.status === 'OFFERED').length,
      PLACED: applications.filter(a => ['ACCEPTED', 'PLACED'].includes(a.status)).length,
      REJECTED: applications.filter(a => a.status === 'REJECTED').length,
    };

    // Compute real package statistics from offer data
    const offerStats = await Application.aggregate([
      { $match: { status: { $in: ['OFFERED', 'ACCEPTED', 'PLACED'] }, 'offerDetails.compensation.max': { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgPackage: { $avg: '$offerDetails.compensation.max' },
          maxPackage: { $max: '$offerDetails.compensation.max' },
          minPackage: { $min: '$offerDetails.compensation.min' },
          totalOffers: { $sum: 1 },
        },
      },
    ]);

    const packageData = offerStats[0] || null;
    const formatLPA = (val) => val ? `${(val / 100000).toFixed(1)} LPA` : null;
    const averagePackage = packageData ? formatLPA(packageData.avgPackage) : 'N/A (no offer data)';
    const highestPackage = packageData ? formatLPA(packageData.maxPackage) : 'N/A (no offer data)';

    const placementRate = totalStudents > 0 ? Math.round((placedStudentsCount / totalStudents) * 100) : 0;

    return {
      overview: {
        totalStudents,
        eligibleStudents: eligibleStudentsCount,
        placedStudents: placedStudentsCount,
        activeDrives: activeDrivesCount,
        companies: companiesCount,
        openJobs: openJobsCount,
        upcomingAssessments: upcomingAssessmentsCount,
      },
      pipeline,
      analytics: {
        placementRate,
        averagePackage,
        highestPackage,
        offersTotal: pipeline.OFFER,
        companiesParticipating: companiesCount,
        packageDataAvailable: Boolean(packageData),
      },
    };
  }

  /**
   * TPO Student Filter & Eligibility Calculation Engine.
   */
  async getStudents(filters = {}) {
    const {
      department,
      course,
      graduationYear,
      minCGPA,
      placementStatus,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const query = {};

    if (department && department !== 'ALL') query.department = department;
    if (course && course !== 'ALL') query.course = course;
    if (graduationYear) query.graduationYear = Number(graduationYear);
    if (placementStatus && placementStatus !== 'ALL') query.placementStatus = placementStatus;
    if (minCGPA) query.cgpa = { $gte: Number(minCGPA) };

    const students = await Student.find(query)
      .populate('user', 'name email isVerified')
      .sort({ cgpa: -1 })
      .lean();

    // Dynamically calculate eligibility & failure reasons
    const enrichedStudents = students.map(student => {
      const reasons = [];
      const minRequiredCGPA = 7.5;

      if ((student.cgpa || 0) < minRequiredCGPA) {
        reasons.push(`CGPA requirement: ${minRequiredCGPA} | Student CGPA: ${student.cgpa || 0}`);
      }

      return {
        ...student,
        isEligible: reasons.length === 0,
        eligibilityReasons: reasons,
      };
    });

    return {
      students: enrichedStudents,
      total: enrichedStudents.length,
    };
  }
}

export const tpoService = new TPOService();
