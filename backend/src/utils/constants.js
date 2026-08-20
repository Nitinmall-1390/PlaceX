// ─── User Roles ────────────────────────────────────────────────────────────────
export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  COMPANY: 'COMPANY',
  TPO: 'TPO',
  ADMIN: 'ADMIN',
});

// ─── Job Statuses ──────────────────────────────────────────────────────────────
export const JOB_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
});

// ─── Valid job status transitions ─────────────────────────────────────────────
export const JOB_STATUS_TRANSITIONS = Object.freeze({
  [JOB_STATUS.DRAFT]: [JOB_STATUS.PENDING_APPROVAL],
  [JOB_STATUS.PENDING_APPROVAL]: [JOB_STATUS.PUBLISHED, JOB_STATUS.DRAFT],
  [JOB_STATUS.PUBLISHED]: [JOB_STATUS.CLOSED],
  [JOB_STATUS.CLOSED]: [JOB_STATUS.ARCHIVED],
  [JOB_STATUS.ARCHIVED]: [],
});

// ─── Application Statuses ──────────────────────────────────────────────────────
export const APPLICATION_STATUS = Object.freeze({
  APPLIED: 'APPLIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  OFFERED: 'OFFERED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  WITHDRAWN: 'WITHDRAWN',
});

// ─── Valid application status transitions ─────────────────────────────────────
// Key: current status → Value: allowed next statuses
export const APPLICATION_STATUS_TRANSITIONS = Object.freeze({
  [APPLICATION_STATUS.APPLIED]: [
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.WITHDRAWN,
  ],
  [APPLICATION_STATUS.UNDER_REVIEW]: [
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.WITHDRAWN,
  ],
  [APPLICATION_STATUS.SHORTLISTED]: [
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.WITHDRAWN,
  ],
  [APPLICATION_STATUS.INTERVIEW]: [
    APPLICATION_STATUS.SELECTED,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.WITHDRAWN,
  ],
  [APPLICATION_STATUS.SELECTED]: [
    APPLICATION_STATUS.OFFERED,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.OFFERED]: [
    APPLICATION_STATUS.ACCEPTED,
    APPLICATION_STATUS.DECLINED,
  ],
  [APPLICATION_STATUS.ACCEPTED]: [],
  [APPLICATION_STATUS.DECLINED]: [],
  [APPLICATION_STATUS.REJECTED]: [],
  [APPLICATION_STATUS.WITHDRAWN]: [],
});

// ─── Placement Drive Statuses ──────────────────────────────────────────────────
export const DRIVE_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

// ─── Drive status transitions ─────────────────────────────────────────────────
export const DRIVE_STATUS_TRANSITIONS = Object.freeze({
  [DRIVE_STATUS.DRAFT]: [DRIVE_STATUS.SCHEDULED, DRIVE_STATUS.CANCELLED],
  [DRIVE_STATUS.SCHEDULED]: [DRIVE_STATUS.ONGOING, DRIVE_STATUS.CANCELLED],
  [DRIVE_STATUS.ONGOING]: [DRIVE_STATUS.COMPLETED, DRIVE_STATUS.CANCELLED],
  [DRIVE_STATUS.COMPLETED]: [],
  [DRIVE_STATUS.CANCELLED]: [],
});

// ─── Notification Types ────────────────────────────────────────────────────────
export const NOTIFICATION_TYPE = Object.freeze({
  JOB_POSTED: 'JOB_POSTED',
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED: 'APPLICATION_STATUS_CHANGED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_REMINDER: 'INTERVIEW_REMINDER',
  DRIVE_CREATED: 'DRIVE_CREATED',
  DRIVE_REMINDER: 'DRIVE_REMINDER',
  SELECTION: 'SELECTION',
  REJECTION: 'REJECTION',
  ADMIN_ANNOUNCEMENT: 'ADMIN_ANNOUNCEMENT',
  OFFER_RECEIVED: 'OFFER_RECEIVED',
});

// ─── Employment Types ──────────────────────────────────────────────────────────
export const EMPLOYMENT_TYPE = Object.freeze({
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  INTERNSHIP: 'INTERNSHIP',
  CONTRACT: 'CONTRACT',
  INTERNSHIP_PPO: 'INTERNSHIP_PPO',
});

// ─── Audit Actions ─────────────────────────────────────────────────────────────
export const AUDIT_ACTION = Object.freeze({
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  COMPANY_APPROVED: 'COMPANY_APPROVED',
  COMPANY_REJECTED: 'COMPANY_REJECTED',
  JOB_CREATED: 'JOB_CREATED',
  JOB_UPDATED: 'JOB_UPDATED',
  JOB_DELETED: 'JOB_DELETED',
  JOB_PUBLISHED: 'JOB_PUBLISHED',
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED: 'APPLICATION_STATUS_CHANGED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  DRIVE_CREATED: 'DRIVE_CREATED',
  DRIVE_UPDATED: 'DRIVE_UPDATED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  ADMIN_ACTION: 'ADMIN_ACTION',
  RESUME_UPLOADED: 'RESUME_UPLOADED',
  AI_ANALYSIS_REQUESTED: 'AI_ANALYSIS_REQUESTED',
});

// ─── Safe fields for sorting/filtering ────────────────────────────────────────
export const JOB_SORT_FIELDS = Object.freeze([
  'createdAt', 'updatedAt', 'deadline', 'title',
  'minimumCGPA', 'compensation.min', 'compensation.max',
]);

export const APPLICATION_SORT_FIELDS = Object.freeze([
  'appliedAt', 'updatedAt', 'status',
]);

// ─── Resume constraints ────────────────────────────────────────────────────────
export const RESUME = Object.freeze({
  MAX_SIZE_BYTES: 5 * 1024 * 1024,  // 5 MB
  ALLOWED_MIME_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
  MAX_VERSIONS: 5,
});

// ─── Pagination ────────────────────────────────────────────────────────────────
export const PAGINATION = Object.freeze({
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

// ─── Token ────────────────────────────────────────────────────────────────────
export const TOKEN = Object.freeze({
  ACCESS_TOKEN_COOKIE: 'placex_at',
  REFRESH_TOKEN_COOKIE: 'placex_rt',
});
