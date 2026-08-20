import Joi from 'joi';

export const driveFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().default('driveDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string(),
  companyId: Joi.string(),
});

export const createDriveSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string(),
  companyId: Joi.string().required(),
  jobs: Joi.array().items(Joi.string()).required(),
  driveDate: Joi.date().iso().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  venue: Joi.string().required(),
  mode: Joi.string().valid('ONLINE', 'OFFLINE', 'HYBRID').required(),
  meetingLink: Joi.string().uri(),
  eligibility: Joi.object({
    minimumCGPA: Joi.number().min(0).max(10),
    courses: Joi.array().items(Joi.string()),
    graduationYears: Joi.array().items(Joi.number()),
    eligibleDepartments: Joi.array().items(Joi.string()),
  }),
  interviewRounds: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    duration: Joi.number().integer(),
    instructions: Joi.string(),
    scheduledAt: Joi.string(),
  })),
});

export default { driveFilterSchema, createDriveSchema };
