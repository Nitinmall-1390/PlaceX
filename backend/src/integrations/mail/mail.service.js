// Stub mail service — replace with real SMTP/email provider when ready.
export const mailService = {
  async sendWelcomeEmail(_email, _name) {
    // no-op
  },
  async sendPasswordResetEmail(_email, _name, _otp) {
    // no-op
  },
  async sendPasswordChangedEmail(_email, _name) {
    // no-op
  },
};

export default mailService;
