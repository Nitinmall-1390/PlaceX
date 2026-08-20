import { Resume } from '../models/Resume.js';
import { Student } from '../models/Student.js';

export class ResumeService {
  async getStudentId(userId) {
    const student = await Student.findOne({ user: userId }).lean();
    return student ? student._id : userId;
  }

  async getStudentResumes(userId) {
    const studentId = await this.getStudentId(userId);
    return Resume.find({ student: studentId }).sort({ createdAt: -1 }).lean();
  }

  async uploadResume(userId, file, req) {
    const studentId = await this.getStudentId(userId);
    const fileUrl = file.path || (file.buffer ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}` : 'https://example.com/resume.pdf');
    const resumeCount = await Resume.countDocuments({ student: studentId });

    // Validate MIME type
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (file.mimetype && !allowedMimes.includes(file.mimetype)) {
      throw new Error('Invalid file format. Only PDF and DOCX files are permitted.');
    }

    const resume = await Resume.create({
      student: studentId,
      fileUrl: fileUrl,
      publicId: file.filename || `resume_${Date.now()}`,
      fileName: file.originalname || 'Resume.pdf',
      mimeType: file.mimetype || 'application/pdf',
      size: file.size || 1024,
      version: resumeCount + 1,
      isPrimary: resumeCount === 0,
      atsScore: null, // Scored upon running real ATS analysis pipeline
    });
    return resume.toObject();
  }

  async deleteResume(resumeId, userId) {
    const studentId = await this.getStudentId(userId);
    const resume = await Resume.findOneAndDelete({ _id: resumeId, student: studentId });
    if (!resume) {
      throw new Error('Resume not found');
    }
    return { message: 'Resume deleted successfully' };
  }

  async setPrimary(resumeId, userId) {
    const studentId = await this.getStudentId(userId);
    await Resume.updateMany({ student: studentId }, { isPrimary: false });
    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, student: studentId },
      { isPrimary: true },
      { new: true }
    );
    if (!resume) {
      throw new Error('Resume not found');
    }
    return resume.toObject();
  }
}

export const resumeService = new ResumeService();
