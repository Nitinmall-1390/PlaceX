import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    type: {
      type: String,
      enum: ['TECHNICAL', 'HR', 'CODING', 'GROUP_DISCUSSION', 'APTITUDE', 'OTHER'],
      default: 'TECHNICAL',
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/px-interview-room',
    },
    location: {
      type: String,
      default: 'Virtual / Online',
    },
    interviewer: {
      name: { type: String, default: 'Lead Technical Interviewer' },
      email: { type: String, default: 'interviews@placex.com' },
      designation: { type: String, default: 'Senior Engineering Manager' },
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'PASSED', 'FAILED'],
      default: 'SCHEDULED',
      index: true,
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

interviewSchema.index({ student: 1, scheduledAt: -1 });
interviewSchema.index({ company: 1, scheduledAt: -1 });

export const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
