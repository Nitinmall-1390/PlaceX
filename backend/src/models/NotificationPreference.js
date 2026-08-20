import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
    },
    categories: {
      applications: { type: Boolean, default: true },
      interviews: { type: Boolean, default: true },
      jobs: { type: Boolean, default: true },
      drives: { type: Boolean, default: true },
      resume: { type: Boolean, default: true },
      profile: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);
export default NotificationPreference;
