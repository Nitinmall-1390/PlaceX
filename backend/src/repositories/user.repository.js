import { BaseRepository } from './base.repository.js';
import { User } from '../models/User.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() }).select('+passwordHash').lean();
  }

  async createUser(data) {
    return this.create(data);
  }

  async updateUser(id, updates) {
    return this.updateById(id, updates);
  }

  async softDeleteUser(id) {
    return this.updateById(id, { isActive: false });
  }
}

export const userRepository = new UserRepository();