import mongoose from 'mongoose';

const assessmentQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['CODING', 'MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'OUTPUT_PREDICTION'],
      default: 'CODING',
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'EASY',
    },
    tags: [{ type: String, trim: true }],
    inputFormat: { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    constraints: { type: String, default: '' },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    visibleTestCases: [
      {
        input: String,
        expectedOutput: String,
      },
    ],
    hiddenTestCases: [
      {
        input: String,
        expectedOutput: String,
      },
    ],
    options: [
      {
        id: String,
        text: String,
        isCorrect: Boolean,
      },
    ],
    allowedLanguages: [{ type: String, default: 'JavaScript' }],
    points: { type: Number, default: 10 },
    negativeMarks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AssessmentQuestion = mongoose.model('AssessmentQuestion', assessmentQuestionSchema);
export default AssessmentQuestion;
