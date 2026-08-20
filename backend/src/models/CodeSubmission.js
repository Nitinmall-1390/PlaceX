import mongoose from 'mongoose';

const codeSubmissionSchema = new mongoose.Schema(
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
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssessmentQuestion',
      required: true,
    },
    language: { type: String, default: 'JavaScript' },
    sourceCode: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACCEPTED', 'WRONG_ANSWER', 'COMPILE_ERROR', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR'],
      default: 'ACCEPTED',
    },
    passedTests: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    executionTimeMs: { type: Number, default: 12 },
    memoryKb: { type: Number, default: 1024 },
    output: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CodeSubmission = mongoose.model('CodeSubmission', codeSubmissionSchema);
export default CodeSubmission;
