import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'APPLICATION_SUBMITTED',
  'APPLICATION_SHORTLISTED',
  'APPLICATION_REJECTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_RESCHEDULED',
  'INTERVIEW_CANCELLED',
  'ASSESSMENT_ASSIGNED',
  'ASSESSMENT_REMINDER',
  'ASSESSMENT_STARTED',
  'ASSESSMENT_COMPLETED',
  'JOB_POSTED',
  'JOB_DEADLINE_REMINDER',
  'ATS_ANALYSIS_COMPLETED',
  'ATS_SCORE_IMPROVED',
  'OFFER_RECEIVED',
  'PROFILE_INCOMPLETE',
  'SYSTEM_ALERT',
  'GENERAL',
];

export const NOTIFICATION_CATEGORIES = [
  'APPLICATION',
  'INTERVIEW',
  'ASSESSMENT',
  'JOB',
  'PROFILE',
  'RESUME',
  'DRIVE',
  'SYSTEM',
  'COMPANY',
  'ADMIN',
  'GENERAL',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: 'GENERAL',
      index: true,
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORIES,
      default: 'APPLICATION',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'],
      default: 'NORMAL',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title too long'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message too long'],
    },
    actionUrl: {
      type: String,
      default: '',
    },
    actionType: {
      type: String,
      default: 'VIEW',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    channel: {
      type: String,
      enum: ['IN_APP', 'EMAIL', 'SOCKET', 'ALL'],
      default: 'IN_APP',
    },
    scheduledFor: {
      type: Date,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    processed: {
      type: Boolean,
      default: true,
      index: true,
    },
    processedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'DELIVERED', 'FAILED', 'EXPIRED'],
      default: 'DELIVERED',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, category: 1, isRead: 1 });
notificationSchema.index({ scheduledFor: 1, processed: 1, status: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;