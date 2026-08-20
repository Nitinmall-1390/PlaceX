import mongoose from 'mongoose';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id).lean();
  }

  async findOne(filter, options = {}) {
    return this.model.findOne(filter, options).lean();
  }

  async findMany(filter = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    return this.model
      .find(filter, options)
      .skip(skip)
      .limit(limit)
      .sort(sort);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async updateById(id, updates) {
    return this.model.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}