import Joi from 'joi';

export const jobFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string(),
  location: Joi.string(),
  employmentType: Joi.string(),
  skills: Joi.string(),
});

export const createJobSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().required(),
  skills: Joi.array().items(Joi.string()),
  preferredSkills: Joi.array().items(Joi.string()),
  eligibility: Joi.object({
    minimumCGPA: Joi.number().min(0).max(10),
    courses: Joi.array().items(Joi.string()),
    graduationYears: Joi.array().items(Joi.number()),
    maxBacklogs: Joi.number().integer().min(0),
  }),
  location: Joi.string().required(),
  employmentType: Joi.string().required(),
  compensation: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string().default('INR'),
    isNegotiable: Joi.boolean().default(false),
  }).required(),
  openings: Joi.number().integer().min(1).required(),
  applicationDeadline: Joi.date().iso().greater('now').required(),
});

export default { jobFilterSchema, createJobSchema };
