// PlaceX Frontend Types

export type Role = 'STUDENT' | 'COMPANY' | 'ADMIN';

export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type StudentProfile = {
  _id: string;
  user: User;
  userProfile?: User;
  studentId: string;
  department: string;
  course: string;
  graduationYear: number;
  cgpa?: number;
  bio?: string;
  placementStatus?: string;
  profileVisibility?: string;
  skills: string[];
  skillProficiencies?: { name: string; proficiency: number }[];
  certifications: Certification[];
  projects: Project[];
  experience: Experience[];
  profileCompletion: number;
  links?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    leetcode?: string;
    codeforces?: string;
  };
  preferences?: {
    preferredRoles?: string[];
    locations?: string[];
    expectedSalary?: string;
    workMode?: string;
    employmentTypes?: string[];
  };
  isEligible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompanyProfile = {
  _id: string;
  name: string;
  industry: string;
  website?: string;
  description?: string;
  recruiter: User;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Certification = {
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
};

export type Project = {
  title: string;
  description?: string;
  technologies: string[];
  link?: string;
};

export type Experience = {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
};

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'INTERNSHIP_PPO';

export type JobStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type Job = {
  _id: string;
  company: CompanyProfile;
  title: string;
  description: string;
  skills: string[];
  preferredSkills: string[];
  eligibility: {
    minimumCGPA?: number;
    courses?: string[];
    graduationYears?: number[];
    eligibleCourses?: string[];
    maxBacklogs?: number;
  };
  location: string;
  employmentType: EmploymentType;
  compensation: {
    min?: number;
    max?: number;
    currency: string;
    isNegotiable: boolean;
  };
  openings: number;
  applicationDeadline: string;
  status: JobStatus;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  applicationCount: number;
  shortlistCount: number;
  selectedCount: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'WITHDRAWN';

export type Application = {
  _id: string;
  student: StudentProfile | string;
  job: Job | string;
  resumeId: Resume | string;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  recruiterNotes?: string;
  studentNotes?: string;
  studentId?: StudentProfile | string;
  jobId?: Job | string;
  interviewSchedule?: InterviewSchedule;
  offerDetails?: OfferDetails;
  createdAt: string;
  updatedAt: string;
};

export type StatusHistoryEntry = {
  status: ApplicationStatus;
  changedBy: User;
  changedAt: string;
  notes?: string;
};

export type InterviewSchedule = {
  scheduledAt: string;
  duration: number;
  type: 'TECHNICAL' | 'HR' | 'GROUP_DISCUSSION' | 'CODING' | 'APTITUDE' | 'OTHER';
  location?: string;
  meetingLink?: string;
  instructions?: string;
};

export type OfferDetails = {
  role: string;
  compensation: {
    min?: number;
    max?: number;
    currency: string;
    isNegotiable: boolean;
  };
  joiningDate: string;
  location?: string;
  offerLetterUrl?: string;
};

export type Resume = {
  _id: string;
  student: StudentProfile | string;
  fileUrl: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  size: number;
  version: number;
  isPrimary: boolean;
  atsScore?: number;
  analysis?: ResumeAnalysis;
  parsedText?: string;
  createdAt: string;
  updatedAt: string;
};

export type ResumeAnalysis = {
  extractedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  summary?: string;
  createdAt: string;
};

export type DriveStatus = 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type DriveMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export type InterviewRoundType = 'APTITUDE' | 'TECHNICAL' | 'HR' | 'GROUP_DISCUSSION' | 'CODING' | 'OTHER';

export type InterviewRound = {
  name: string;
  type: InterviewRoundType;
  duration?: number;
  instructions?: string;
  scheduledAt?: string;
};

export type PlacementDrive = {
  _id: string;
  company: CompanyProfile;
  jobs: Job[];
  title: string;
  description?: string;
  driveDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  mode: DriveMode;
  meetingLink?: string;
  eligibility: {
    minimumCGPA?: number;
    courses?: string[];
    graduationYears?: number[];
    eligibleDepartments?: string[];
  };
  participants: DriveParticipant[];
  interviewRounds: InterviewRound[];
  status: DriveStatus;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type DriveParticipant = {
  student: StudentProfile | string;
  registeredAt: string;
  attended: boolean;
};

export type NotificationType =
  | 'JOB_POSTED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_REMINDER'
  | 'DRIVE_CREATED'
  | 'DRIVE_REMINDER'
  | 'SELECTION'
  | 'REJECTION'
  | 'ADMIN_ANNOUNCEMENT'
  | 'OFFER_RECEIVED';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SOCKET' | 'ALL';

export type Notification = {
  _id: string;
  recipient: User;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  channel: NotificationChannel;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type RefreshResponse = {
  accessToken: string;
};

export type StudentStats = {
  totalApplications: number;
  byStatus: Record<string, number>;
  interviews: number;
  shortlists: number;
  selections: number;
  placementStatus: boolean;
};

export type StudentAnalytics = {
  studentProfile: {
    name: string;
    cgpa?: number;
    skills: string[];
    certifications: Certification[];
    strengths: string[];
    recommendations: string[];
  };
  applicationStats: {
    total: number;
    byStatus: Record<string, number>;
    interviews: number;
    shortlists: number;
    placements: number;
  };
};

export type CompanyAnalytics = {
  totalJobs: number;
  publishedJobs: number;
  applications: number;
  topSkills: [string, number][];
};

export type AdminAnalytics = {
  totalStudents: number;
  totalCompanies: number;
  totalJobs: number;
  totalDrives: number;
  totalApplications?: number;
  placedStudents?: number;
  successRate?: number;
  studentStats: StudentAnalytics[];
  companyStats: CompanyAnalytics[];
  driveStats: Record<string, unknown>[];
};

export type AIAnalysisResult = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  atsScore: number;
  recommendations: string[];
  analysisDate: string;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ApiError = {
  success: false;
  message: string;
  code?: string;
  errors?: ValidationError[];
  requestId?: string;
};

export type SocketEvent = {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
};
