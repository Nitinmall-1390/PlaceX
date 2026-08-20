export class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async getById(id) {
    const doc = await this.repository.findById(id);
    if (!doc) throw new Error('Resource not found');
    return doc;
  }

  async create(data) {
    return this.repository.create(data);
  }

  async update(id, updates) {
    return this.repository.updateById(id, updates);
  }

  async delete(id) {
    return this.repository.deleteById(id);
  }

  async list(filter = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    return this.repository.findMany(filter, { skip, limit, sort });
  }

  async count(filter = {}) {
    return this.repository.count(filter);
  }
}