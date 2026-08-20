import mongoose from 'mongoose';
import { DRIVE_STATUS } from '../utils/constants.js';

const interviewRoundSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['APTITUDE', 'TECHNICAL', 'HR', 'GROUP_DISCUSSION', 'CODING', 'OTHER'] },
  duration: { type: Number }, // minutes
  instructions: { type: String, trim: true },
  scheduledAt: { type: Date },
});

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    jobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    }],
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description too long'],
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    mode: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'HYBRID'],
      required: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    eligibility: {
      minimumCGPA: { type: Number, min: 0, max: 10 },
      courses: [{ type: String, trim: true }],
      graduationYears: [{ type: Number }],
      eligibleDepartments: [{ type: String, trim: true }],
    },
    participants: [{
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      registeredAt: { type: Date, default: Date.now },
      attended: { type: Boolean, default: false },
    }],
    interviewRounds: [interviewRoundSchema],
    status: {
      type: String,
      enum: Object.values(DRIVE_STATUS),
      default: DRIVE_STATUS.DRAFT,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

placementDriveSchema.index({ company: 1, status: 1, driveDate: -1 });
placementDriveSchema.index({ status: 1, driveDate: 1 });
placementDriveSchema.index({ createdBy: 1 });

export const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);
export default PlacementDrive;