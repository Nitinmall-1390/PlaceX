// PlaceX Frontend Constants

export const ROLES = {
  STUDENT: 'STUDENT',
  COMPANY: 'COMPANY',
  TPO: 'TPO',
  ADMIN: 'ADMIN',
} as const;

export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const APPLICATION_STATUS = {
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
} as const;

export const DRIVE_STATUS = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  INTERNSHIP: 'INTERNSHIP',
  CONTRACT: 'CONTRACT',
  INTERNSHIP_PPO: 'INTERNSHIP_PPO',
} as const;

export const NOTIFICATION_TYPE = {
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
} as const;

// Status display configuration
export const STATUS_CONFIG = {
  [APPLICATION_STATUS.APPLIED]: {
    label: 'Applied',
    icon: 'FileText',
    color: 'info',
    bgColor: 'info-bg',
  },
  [APPLICATION_STATUS.UNDER_REVIEW]: {
    label: 'Under Review',
    icon: 'Eye',
    color: 'warning',
    bgColor: 'warning-bg',
  },
  [APPLICATION_STATUS.SHORTLISTED]: {
    label: 'Shortlisted',
    icon: 'Star',
    color: 'secondary',
    bgColor: 'secondary-bg',
  },
  [APPLICATION_STATUS.INTERVIEW]: {
    label: 'Interview',
    icon: 'Calendar',
    color: 'primary',
    bgColor: 'secondary',
  },
  [APPLICATION_STATUS.SELECTED]: {
    label: 'Selected',
    icon: 'CheckCircle',
    color: 'success',
    bgColor: 'success-bg',
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: 'Rejected',
    icon: 'XCircle',
    color: 'error',
    bgColor: 'error-bg',
  },
  [APPLICATION_STATUS.OFFERED]: {
    label: 'Offer Received',
    icon: 'Gift',
    color: 'accent',
    bgColor: 'accent-bg',
  },
  [APPLICATION_STATUS.ACCEPTED]: {
    label: 'Accepted',
    icon: 'ThumbsUp',
    color: 'success',
    bgColor: 'success-bg',
  },
  [APPLICATION_STATUS.DECLINED]: {
    label: 'Declined',
    icon: 'ThumbsDown',
    color: 'muted',
    bgColor: 'muted',
  },
  [APPLICATION_STATUS.WITHDRAWN]: {
    label: 'Withdrawn',
    icon: 'LogOut',
    color: 'muted',
    bgColor: 'muted',
  },
} as const;

export const JOB_STATUS_CONFIG = {
  [JOB_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'muted',
  },
  [JOB_STATUS.PENDING_APPROVAL]: {
    label: 'Pending Approval',
    color: 'warning',
  },
  [JOB_STATUS.PUBLISHED]: {
    label: 'Published',
    color: 'success',
  },
  [JOB_STATUS.CLOSED]: {
    label: 'Closed',
    color: 'error',
  },
  [JOB_STATUS.ARCHIVED]: {
    label: 'Archived',
    color: 'muted',
  },
} as const;

export const EMPLOYMENT_TYPE_LABELS = {
  [EMPLOYMENT_TYPE.FULL_TIME]: 'Full Time',
  [EMPLOYMENT_TYPE.PART_TIME]: 'Part Time',
  [EMPLOYMENT_TYPE.INTERNSHIP]: 'Internship',
  [EMPLOYMENT_TYPE.CONTRACT]: 'Contract',
  [EMPLOYMENT_TYPE.INTERNSHIP_PPO]: 'Internship with PPO',
};

export const STUDENT_NAVIGATION = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/student/dashboard' },
  { label: 'PX Readiness Index', icon: 'Award', path: '/student/readiness' },
  { label: 'Jobs', icon: 'Briefcase', path: '/student/jobs' },
  { label: 'Applications', icon: 'FileText', path: '/student/applications' },
  { label: 'Interviews', icon: 'Calendar', path: '/student/interviews' },
  { label: 'Coding Assessments', icon: 'Terminal', path: '/student/assessments' },
  { label: 'Resume', icon: 'FileText', path: '/student/resume' },
  { label: 'ATS Analyzer', icon: 'BrainCircuit', path: '/student/ats' },
  { label: 'AI Career Assistant', icon: 'BrainCircuit', path: '/student/ai' },
  { label: 'Notifications', icon: 'Bell', path: '/notifications' },
  { label: 'Profile', icon: 'User', path: '/student/profile' },
];

export const COMPANY_NAVIGATION = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/company/dashboard' },
  { label: 'Jobs', icon: 'Briefcase', path: '/company/jobs' },
  { label: 'Applicants', icon: 'Users', path: '/company/applicants' },
  { label: 'Placement Drives', icon: 'Calendar', path: '/company/drives' },
  { label: 'Analytics', icon: 'BarChart3', path: '/company/analytics' },
  { label: 'Notifications', icon: 'Bell', path: '/notifications' },
  { label: 'Company Profile', icon: 'Building2', path: '/company/profile' },
];

export const TPO_NAVIGATION = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/tpo/dashboard' },
  { label: 'Student Roster', icon: 'GraduationCap', path: '/tpo/students' },
  { label: 'Placement Drives', icon: 'Calendar', path: '/tpo/drives' },
  { label: 'Coding Assessments', icon: 'BrainCircuit', path: '/tpo/assessments' },
  { label: 'Placement Analytics', icon: 'BarChart3', path: '/tpo/analytics' },
  { label: 'Notifications', icon: 'Bell', path: '/notifications' },
];

export const ADMIN_NAVIGATION = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin/dashboard' },
  { label: 'Students', icon: 'GraduationCap', path: '/admin/students' },
  { label: 'Companies', icon: 'Building2', path: '/admin/companies' },
  { label: 'Jobs', icon: 'Briefcase', path: '/admin/jobs' },
  { label: 'Applications', icon: 'FileText', path: '/admin/applications' },
  { label: 'Placement Drives', icon: 'Calendar', path: '/admin/drives' },
  { label: 'Analytics', icon: 'BarChart3', path: '/admin/analytics' },
  { label: 'Audit Logs', icon: 'ShieldCheck', path: '/admin/audit-logs' },
  { label: 'Notifications', icon: 'Bell', path: '/notifications' },
  { label: 'Settings', icon: 'Settings', path: '/admin/settings' },
];

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'placex_access_token',
  USER_ROLE: 'placex_user_role',
  REFRESH_TOKEN: 'placex_rt',
  USER_DATA: 'placex_user_data',
};

// Pagination constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Resume limits
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const ALLOWED_FILE_EXTENSIONS = ['.pdf'];

// AI rate limit
export const AI_RATE_LIMIT = 10;
