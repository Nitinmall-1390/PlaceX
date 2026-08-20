import Joi from 'joi';

export const applySchema = Joi.object({
  jobId: Joi.string().required(),
  resumeId: Joi.string(),
  studentNotes: Joi.string(),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().required(),
  notes: Joi.string(),
});

export const recruiterNotesSchema = Joi.object({
  recruiterNotes: Joi.string().required(),
});

export const interviewScheduleSchema = Joi.object({
  scheduledAt: Joi.date().iso().required(),
  duration: Joi.number().integer().min(15).required(),
  type: Joi.string().required(),
  location: Joi.string(),
  meetingLink: Joi.string().uri(),
  instructions: Joi.string(),
});

export const offerDetailsSchema = Joi.object({
  role: Joi.string().required(),
  compensation: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string().default('INR'),
    isNegotiable: Joi.boolean().default(false),
  }).required(),
  joiningDate: Joi.date().iso().required(),
  location: Joi.string(),
});

export default {
  applySchema,
  updateApplicationStatusSchema,
  recruiterNotesSchema,
  interviewScheduleSchema,
  offerDetailsSchema,
};
