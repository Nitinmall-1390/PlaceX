import Joi from 'joi';

export const updateCompanyProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  industry: Joi.string(),
  website: Joi.string().uri(),
  description: Joi.string(),
  contactInfo: Joi.object({
    email: Joi.string().email(),
    phone: Joi.string(),
    address: Joi.string(),
  }),
});

export const verifyCompanySchema = Joi.object({
  isVerified: Joi.boolean().required(),
  rejectionReason: Joi.string().when('isVerified', { is: false, then: Joi.required() }),
});

export default { updateCompanyProfileSchema, verifyCompanySchema };
