import mongoose from 'mongoose';
import { APPLICATION_STATUS, APPLICATION_STATUS_TRANSITIONS } from '../utils/constants.js';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
      index: true,
    },
    statusHistory: [statusHistorySchema],
    recruiterNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes too long'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });

applicationSchema.methods.canTransitionTo = function (newStatus) {
  const currentStatus = this.status;
  const allowedTransitions = APPLICATION_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
};

applicationSchema.methods.addStatusHistory = function (status, changedBy, notes) {
  this.statusHistory.push({
    status: status,
    changedBy: changedBy,
    notes: notes,
    changedAt: new Date(),
  });
  this.status = status;
};

export const Application = mongoose.model('Application', applicationSchema);
export default Application;
