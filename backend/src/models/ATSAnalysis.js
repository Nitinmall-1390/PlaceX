import mongoose from 'mongoose';

const atsAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    resumeVersion: {
      type: Number,
      default: 1,
    },
    targetJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      index: true,
    },
    targetRole: {
      type: String,
      default: 'Software Engineer',
      trim: true,
    },
    jobDescriptionText: {
      type: String,
      trim: true,
      default: '',
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scores: {
      parsingScore: { type: Number, default: 90 },
      contentQualityScore: { type: Number, default: 85 },
      keywordScore: { type: Number, default: 80 },
      jobMatchScore: { type: Number, default: 82 },
      experienceScore: { type: Number, default: 80 },
      educationScore: { type: Number, default: 95 },
      achievementScore: { type: Number, default: 75 },
      structureScore: { type: Number, default: 90 },
      contactScore: { type: Number, default: 98 },
    },
    parsingConfidence: {
      contact: { type: Number, default: 98 },
      education: { type: Number, default: 94 },
      experience: { type: Number, default: 91 },
      skills: { type: Number, default: 97 },
      projects: { type: Number, default: 89 },
    },
    keywordAnalysis: {
      matched: [{ type: String }],
      missing: [{ type: String }],
      partial: [{ type: String }],
      keywordStuffingDetected: { type: Boolean, default: false },
    },
    skillsAnalysis: {
      matched: [{ type: String }],
      missing: [{ type: String }],
      partial: [{ type: String }],
      normalizedSkills: [{ type: String }],
    },
    experienceRelevance: {
      score: { type: Number, default: 80 },
      feedback: { type: String, default: '' },
      titleMatchScore: { type: Number, default: 85 },
    },
    achievementAnalysis: {
      weakBullets: [{ type: String }],
      strongBullets: [{ type: String }],
      suggestions: [{ current: String, recommended: String }],
    },
    formattingRisks: [{
      level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
      risk: { type: String, required: true },
      reason: { type: String, required: true },
    }],
    sectionAnalysis: [{
      sectionName: { type: String, required: true },
      status: { type: String, enum: ['EXCELLENT', 'GOOD', 'RISK', 'MISSING'], default: 'GOOD' },
      feedback: { type: String, default: '' },
    }],
    recommendations: [{
      priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
      title: { type: String, required: true },
      description: { type: String, required: true },
      category: { type: String, default: 'GENERAL' },
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

atsAnalysisSchema.index({ user: 1, createdAt: -1 });
atsAnalysisSchema.index({ resume: 1, createdAt: -1 });

export const ATSAnalysis = mongoose.model('ATSAnalysis', atsAnalysisSchema);
export default ATSAnalysis;
