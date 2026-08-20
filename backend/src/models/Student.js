import mongoose from 'mongoose';
import { EMPLOYMENT_TYPE } from '../utils/constants.js';

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [2000, 'Invalid graduation year'],
      max: [2100, 'Invalid graduation year'],
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio too long'],
      default: 'Passionate engineering student preparing for full-stack software development roles.',
    },
    placementStatus: {
      type: String,
      enum: ['OPEN_TO_OPPORTUNITIES', 'ACTIVE_APPLICATIONS', 'INTERVIEWING', 'OFFER_RECEIVED', 'PLACED'],
      default: 'OPEN_TO_OPPORTUNITIES',
    },
    profileVisibility: {
      type: String,
      enum: ['PUBLIC', 'RECRUITERS_ONLY', 'PRIVATE'],
      default: 'RECRUITERS_ONLY',
    },
    skills: [{
      type: String,
      trim: true,
    }],
    skillProficiencies: [{
      name: { type: String, required: true },
      proficiency: { type: Number, default: 80, min: 0, max: 100 },
    }],
    certifications: [{
      name: { type: String, required: true, trim: true },
      issuer: { type: String, trim: true },
      issueDate: { type: Date },
      credentialId: { type: String, trim: true },
      credentialUrl: { type: String, trim: true },
    }],
    projects: [{
      title: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      technologies: [{ type: String, trim: true }],
      link: { type: String, trim: true },
      githubUrl: { type: String, trim: true },
      liveDemoUrl: { type: String, trim: true },
      role: { type: String, trim: true },
      duration: { type: String, trim: true },
    }],
    experience: [{
      company: { type: String, required: true, trim: true },
      role: { type: String, required: true, trim: true },
      type: { type: String, enum: ['INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'FREELANCE'], default: 'INTERNSHIP' },
      startDate: { type: Date },
      endDate: { type: Date },
      isCurrent: { type: Boolean, default: false },
      description: { type: String, trim: true },
      skills: [{ type: String, trim: true }],
    }],
    profileCompletion: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    links: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      portfolio: { type: String, trim: true },
      leetcode: { type: String, trim: true },
      codeforces: { type: String, trim: true },
    },
    preferences: {
      preferredRoles: [{ type: String, trim: true }],
      locations: [{ type: String, trim: true }],
      expectedSalary: { type: String, trim: true },
      workMode: { type: String, default: 'HYBRID' },
      employmentTypes: [{ type: String }],
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    readinessIndex: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    lastReadinessComputed: {
      type: Date,
      default: null,
    },
    readinessHistory: [{
      score: { type: Number, min: 0, max: 100 },
      snapshotAt: { type: Date },
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.index({ department: 1, graduationYear: 1 });
studentSchema.index({ cgpa: -1 });

export const Student = mongoose.model('Student', studentSchema);
export default Student;