import Joi from 'joi';

export const updateStudentProfileSchema = Joi.object({
  studentId: Joi.string().allow(''),
  department: Joi.string().allow(''),
  course: Joi.string().allow(''),
  graduationYear: Joi.number().integer(),
  cgpa: Joi.number().min(0).max(10),
  bio: Joi.string().allow(''),
  placementStatus: Joi.string().valid('OPEN_TO_OPPORTUNITIES', 'ACTIVE_APPLICATIONS', 'INTERVIEWING', 'OFFER_RECEIVED', 'PLACED'),
  profileVisibility: Joi.string().valid('PUBLIC', 'RECRUITERS_ONLY', 'PRIVATE'),
  skills: Joi.array().items(Joi.string().allow('')),
  skillProficiencies: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    proficiency: Joi.number().min(0).max(100),
  })),
  certifications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    issuer: Joi.string().allow(''),
    issueDate: Joi.any(),
    expiryDate: Joi.any(),
    credentialId: Joi.string().allow(''),
    credentialUrl: Joi.string().allow(''),
  })),
  projects: Joi.array().items(Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    technologies: Joi.array().items(Joi.string()),
    link: Joi.string().allow(''),
    githubUrl: Joi.string().allow(''),
    liveDemoUrl: Joi.string().allow(''),
    role: Joi.string().allow(''),
    duration: Joi.string().allow(''),
  })),
  experience: Joi.array().items(Joi.object({
    company: Joi.string().required(),
    role: Joi.string().required(),
    type: Joi.string().valid('INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'FREELANCE'),
    startDate: Joi.any(),
    endDate: Joi.any(),
    isCurrent: Joi.boolean(),
    description: Joi.string().allow(''),
    skills: Joi.array().items(Joi.string()),
  })),
  links: Joi.object({
    linkedin: Joi.string().allow(''),
    github: Joi.string().allow(''),
    portfolio: Joi.string().allow(''),
    leetcode: Joi.string().allow(''),
    codeforces: Joi.string().allow(''),
  }),
  preferences: Joi.object({
    preferredRoles: Joi.array().items(Joi.string().allow('')),
    locations: Joi.array().items(Joi.string().allow('')),
    expectedSalary: Joi.string().allow(''),
    workMode: Joi.string().allow(''),
    employmentTypes: Joi.array().items(Joi.string()),
  }),
});

export default { updateStudentProfileSchema };
