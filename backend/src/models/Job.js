import mongoose from 'mongoose';
import { JOB_STATUS, EMPLOYMENT_TYPE } from '../utils/constants.js';

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    preferredSkills: [{
      type: String,
      trim: true,
    }],
    eligibility: {
      minimumCGPA: {
        type: Number,
        min: 0,
        max: 10,
      },
      courses: [{ type: String, trim: true }],
      graduationYears: [{ type: Number, min: 2000, max: 2100 }],
      eligibleCourses: [{ type: String, trim: true }],
      maxBacklogs: { type: Number, min: 0 },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPE),
      required: true,
    },
    compensation: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
      isNegotiable: { type: Boolean, default: false },
    },
    openings: {
      type: Number,
      required: true,
      min: 1,
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.DRAFT,
      index: true,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    shortlistCount: {
      type: Number,
      default: 0,
    },
    selectedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.index({ company: 1, status: 1, createdAt: -1 });
jobSchema.index({ status: 1, applicationDeadline: 1 });
jobSchema.index({ 'eligibility.minimumCGPA': 1 });
jobSchema.index({ skills: 1 });

jobSchema.virtual('isActive').get(function () {
  return this.status === JOB_STATUS.PUBLISHED && new Date() < this.applicationDeadline;
});

export const Job = mongoose.model('Job', jobSchema);
export default Job;