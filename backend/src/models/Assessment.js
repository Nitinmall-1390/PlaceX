import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ['TPO', 'COMPANY', 'ADMIN'],
      default: 'TPO',
    },
    description: { type: String, default: '' },
    duration: { type: Number, default: 90 }, // in minutes
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: () => new Date(Date.now() + 7 * 86400000) },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentQuestion',
      },
    ],
    allowedLanguages: {
      type: [String],
      default: ['JavaScript', 'Python', 'C++', 'Java'],
    },
    passingScore: { type: Number, default: 70 },
    maxAttempts: { type: Number, default: 1 },
    negativeMarking: { type: Boolean, default: false },
    rankingEnabled: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },
    instructions: { type: String, default: 'Maintain tab focus. Code autosaves periodically.' },
  },
  { timestamps: true }
);

export const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
