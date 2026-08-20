import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Invalid website URL'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description too long'],
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactInfo: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    logoUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

companySchema.index({ isVerified: 1, createdAt: -1 });
companySchema.index({ industry: 1 });

export const Company = mongoose.model('Company', companySchema);
export default Company;