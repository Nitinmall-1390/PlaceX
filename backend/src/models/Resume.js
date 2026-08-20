import mongoose from 'mongoose';
import { RESUME } from '../utils/constants.js';

const resumeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: RESUME.ALLOWED_MIME_TYPES,
    },
    size: {
      type: Number,
      required: true,
      max: [RESUME.MAX_SIZE_BYTES, 'File too large'],
    },
    version: {
      type: Number,
      default: 1,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    analysis: {
      extractedSkills: [{ type: String, trim: true }],
      missingSkills: [{ type: String, trim: true }],
      strengths: [{ type: String, trim: true }],
      recommendations: [{ type: String, trim: true }],
      summary: { type: String, trim: true },
      createdAt: { type: Date },
    },
    parsedText: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

resumeSchema.index({ student: 1, createdAt: -1 });

// Only one primary resume per student
resumeSchema.index(
  { student: 1, isPrimary: 1 },
  { unique: true, partialFilterExpression: { isPrimary: true } }
);

export const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;