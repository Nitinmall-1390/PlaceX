import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { Resume } from '../models/Resume.js';
import { AuditLog } from '../models/AuditLog.js';
import { ROLES } from '../utils/constants.js';
import { auditService } from './audit.service.js';

export class StudentService {
  async getProfile(userId) {
    let student = await Student.findOne({ user: userId })
      .populate('user', 'name email role isVerified lastLoginAt createdAt')
      .lean();

    if (!student) {
      // Auto-create a clean empty profile — do NOT seed fake data
      student = await Student.create({
        user: userId,
        studentId: `STU${Date.now().toString().slice(-6)}`,
        department: '',
        course: '',
        graduationYear: new Date().getFullYear() + 4,
        skills: [],
        profileCompletion: 10,
      });
      student = await Student.findById(student._id)
        .populate('user', 'name email role isVerified lastLoginAt createdAt')
        .lean();
    }

    return student;
  }

  async updateProfile(userId, updates) {
    let student = await Student.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!student) {
      throw new Error('Student profile not found');
    }

    const profileCompletion = this.calculateProfileCompletion(student);
    student.profileCompletion = profileCompletion;
    await student.save();

    await auditService.log({
      actor: { _id: userId, role: ROLES.STUDENT },
      action: 'UPDATE_PROFILE',
      entity: 'Student',
      entityId: student._id,
      metadata: { updatesKeys: Object.keys(updates) },
    });

    return Student.findById(student._id)
      .populate('user', 'name email role isVerified lastLoginAt createdAt')
      .lean();
  }

  calculateProfileCompletion(student) {
    const checks = [
      Boolean(student.studentId),
      Boolean(student.department),
      Boolean(student.course),
      Boolean(student.graduationYear),
      Boolean(student.cgpa),
      Boolean(student.bio && student.bio.length > 10),
      Boolean(student.skills && student.skills.length >= 3),
      Boolean(student.projects && student.projects.length >= 1),
      Boolean(student.experience && student.experience.length >= 1),
      Boolean(student.certifications && student.certifications.length >= 1),
      Boolean(student.links?.github || student.links?.linkedin),
    ];

    const filled = checks.filter(Boolean).length;
    return Math.min(100, Math.round((filled / checks.length) * 100));
  }

  async getProfileStrength(userId) {
    const student = await Student.findOne({ user: userId }).lean();
    if (!student) throw new Error('Student profile not found');

    const primaryResume = await Resume.findOne({ student: student._id, isPrimary: true }).lean();

    const recommendations = [];
    let score = 50;

    if (student.cgpa >= 8.0) score += 10;
    if (student.skills && student.skills.length >= 5) {
      score += 10;
    } else {
      recommendations.push({ key: 'skills', title: 'Add 2 more technical skills', weight: 10, action: 'ADD_SKILLS' });
    }

    if (student.projects && student.projects.length >= 2) {
      score += 15;
    } else {
      recommendations.push({ key: 'projects', title: 'Add 1 production project', weight: 15, action: 'ADD_PROJECT' });
    }

    if (student.links?.github && student.links?.linkedin) {
      score += 10;
    } else {
      recommendations.push({ key: 'links', title: 'Connect GitHub and LinkedIn profiles', weight: 10, action: 'ADD_LINKS' });
    }

    if (primaryResume) {
      score += 15;
    } else {
      recommendations.push({ key: 'resume', title: 'Upload primary PDF resume for ATS screening', weight: 15, action: 'UPLOAD_RESUME' });
    }

    if (student.certifications && student.certifications.length >= 1) {
      score += 10;
    } else {
      recommendations.push({ key: 'certifications', title: 'Add industry certification credential', weight: 10, action: 'ADD_CERT' });
    }

    return {
      score: Math.min(100, score),
      summary: score >= 80 ? 'Your profile is strong and optimized for recruiter visibility.' : 'Complete pending items to boost placement matching.',
      recommendations,
    };
  }

  async getProfileActivity(userId) {
    const logs = await AuditLog.find({ actor: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return logs;
  }

  async getAllStudents(filters = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    const students = await Student.find(filters)
      .populate('userProfile', 'name email role isVerified lastLoginAt')
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    const total = await Student.countDocuments(filters);
    return { students, total };
  }
}

export const studentService = new StudentService();