import { BaseRepository } from './base.repository.js';
import { Student } from '../models/Student.js';

export class StudentRepository extends BaseRepository {
  constructor() {
    super(Student);
  }

  async findByUserId(userId) {
    return this.findOne({ user: userId });
  }

  async findByStudentId(studentId) {
    return this.findOne({ studentId });
  }

  async findWithUser(filter = {}, options = {}) {
    return this.model
      .find(filter)
      .populate('userProfile', 'name email role isVerified lastLoginAt')
      .skip(options.skip || 0)
      .limit(options.limit || 20)
      .sort(options.sort || { createdAt: -1 })
      .lean();
  }

  async updateProfile(userId, updates) {
    return this.model.findOneAndUpdate({ user: userId }, { $set: updates }, { new: true }).lean();
  }
}

export const studentRepository = new StudentRepository();