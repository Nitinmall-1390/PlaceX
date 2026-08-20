import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  role: Joi.string().valid('STUDENT', 'COMPANY', 'TPO', 'ADMIN').required(),
  studentId: Joi.string().when('role', { is: 'STUDENT', then: Joi.required() }),
  department: Joi.string().when('role', { is: 'STUDENT', then: Joi.required() }),
  course: Joi.string().when('role', { is: 'STUDENT', then: Joi.required() }),
  graduationYear: Joi.number().integer().min(2000).max(2100).when('role', { is: 'STUDENT', then: Joi.required() }),
  companyName: Joi.string().when('role', { is: 'COMPANY', then: Joi.required() }),
  industry: Joi.string().when('role', { is: 'COMPANY', then: Joi.required() }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  otp: Joi.string().length(6).required(),
  password: Joi.string().min(8).required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

export default { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema };