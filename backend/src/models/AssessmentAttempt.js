import mongoose from 'mongoose';

const assessmentAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    lastSavedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'SUBMITTED', 'EXPIRED', 'EVALUATED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    remainingTimeSeconds: { type: Number, default: 5400 },
    answers: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    codeSnapshots: { type: Map, of: String, default: {} },
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    percentile: { type: Number, default: 0 },
    integrityLogs: [
      {
        type: { type: String, enum: ['TAB_BLUR', 'FULLSCREEN_EXIT', 'PASTE_EVENT'] },
        timestamp: { type: Date, default: Date.now },
        details: String,
      },
    ],
  },
  { timestamps: true }
);

assessmentAttemptSchema.index({ student: 1, assessment: 1 }, { unique: true });

export const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
export default AssessmentAttempt;
