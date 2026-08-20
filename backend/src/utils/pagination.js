import { config } from '../config/env.js';
import { PAGINATION } from './constants.js';

/**
 * Parse and validate pagination parameters from request query.
 *
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(query = {}) {
  const rawPage = parseInt(query.page, 10);
  const rawLimit = parseInt(query.limit, 10);

  const page = rawPage > 0 ? rawPage : 1;
  const limit = rawLimit > 0
    ? Math.min(rawLimit, PAGINATION.MAX_LIMIT)
    : PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination meta object for API responses.
 *
 * @param {number} total - Total documents matching query
 * @param {number} page - Current page number
 * @param {number} limit - Page size
 * @returns {object} Pagination metadata
 */
export function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Apply safe sorting from query params.
 * Only allows fields from the provided allowlist.
 *
 * @param {object} query - Express req.query
 * @param {string[]} allowedFields - Allowlisted sort fields
 * @param {string} defaultField - Default sort field
 * @returns {object} Mongoose sort object
 */
export function parseSorting(query = {}, allowedFields = [], defaultField = 'createdAt') {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  return { [sortBy]: sortOrder };
}
