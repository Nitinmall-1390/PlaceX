import apiClient from './apiClient';
import { type User, type StudentProfile, type CompanyProfile, type AdminAnalytics, type StudentAnalytics, type CompanyAnalytics } from '../../types';

export const studentApi = {
  // GET /api/v1/students/me
  getProfile: async (): Promise<StudentProfile> => {
    const response = await apiClient.get<StudentProfile>('/students/me');
    return response.data.data!;
  },

  // PATCH /api/v1/students/me
  updateProfile: async (data: Partial<StudentProfile>): Promise<StudentProfile> => {
    const response = await apiClient.patch<StudentProfile>('/students/me', data);
    return response.data.data!;
  },

  // GET /api/v1/students/me/stats
  getStats: async (): Promise<unknown> => {
    const response = await apiClient.get<unknown>('/students/me/stats');
    return response.data.data!;
  },

  // GET /api/v1/students/me/strength
  getStrength: async (): Promise<{ score: number; summary: string; recommendations: Array<{ key: string; title: string; weight: number; action: string }> }> => {
    const response = await apiClient.get<{ score: number; summary: string; recommendations: Array<{ key: string; title: string; weight: number; action: string }> }>('/students/me/strength');
    return response.data.data!;
  },

  // GET /api/v1/students/me/activity
  getActivity: async (): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>('/students/me/activity');
    return response.data.data!;
  },

  // GET /api/v1/students/:id (admin only)
  getStudentById: async (id: string): Promise<StudentProfile> => {
    const response = await apiClient.get<StudentProfile>(`/students/${id}`);
    return response.data.data!;
  },

  // GET /api/v1/applications/me (student only)
  getMyApplications: async (params?: { page?: number; limit?: number }): Promise<{
    applications: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      applications: unknown[];
      meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
    }>(`/applications/me?${query.toString()}`);
    return response.data.data!;
  },

  // GET /api/v1/students (admin only)
  getAll: async (params?: { page?: number; limit?: number }): Promise<{
    students: StudentProfile[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      students: StudentProfile[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/students?${query.toString()}`);
    return response.data.data!;
  },
};

export const companyApi = {
  // GET /api/v1/companies/me
  getProfile: async (): Promise<CompanyProfile> => {
    const response = await apiClient.get<CompanyProfile>('/companies/me');
    return response.data.data!;
  },

  // PATCH /api/v1/companies/me
  updateProfile: async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
    const response = await apiClient.patch<CompanyProfile>('/companies/me', data);
    return response.data.data!;
  },

  // GET /api/v1/companies (admin only)
  getAll: async (params?: { page?: number; limit?: number }): Promise<{
    companies: CompanyProfile[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      companies: CompanyProfile[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/companies?${query.toString()}`);
    return response.data.data!;
  },

  // GET /api/v1/companies/pending (admin only)
  getPending: async (params?: { page?: number; limit?: number }): Promise<{
    companies: CompanyProfile[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      companies: CompanyProfile[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/companies/pending?${query.toString()}`);
    return response.data.data!;
  },

  // PATCH /api/v1/companies/:id/verify (admin only)
  verify: async (id: string, data: { isVerified: boolean; rejectionReason?: string }): Promise<CompanyProfile> => {
    const response = await apiClient.patch<CompanyProfile>(`/companies/${id}/verify`, data);
    return response.data.data!;
  },
};

export const jobApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: unknown;
  }): Promise<{
    items: Record<string, unknown>[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    const response = await apiClient.get<{
      jobs: Record<string, unknown>[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(`/jobs?${query.toString()}`);
    return {
      items: response.data.data?.jobs || [],
      meta: response.data.data?.meta || {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  getById: async (id: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>(`/jobs/${id}`);
    return response.data.data!;
  },

  create: async (data: unknown): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>('/jobs', data);
    return response.data.data!;
  },

  update: async (id: string, data: unknown): Promise<Record<string, unknown>> => {
    const response = await apiClient.patch<Record<string, unknown>>(`/jobs/${id}`, data);
    return response.data.data!;
  },

  submitForApproval: async (id: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(`/jobs/${id}/submit`);
    return response.data.data!;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/jobs/${id}`);
    return { message: response.data.message };
  },

  checkEligibility: async (jobId: string): Promise<{ eligible: boolean; reasons?: string[]; missingFields?: string[] }> => {
    const response = await apiClient.get<{ eligible: boolean; reasons?: string[]; missingFields?: string[] }>(
      `/jobs/${jobId}/eligibility`
    );
    return response.data.data!;
  },
};

export const applicationApi = {
  // POST /api/v1/applications
  apply: async (data: { jobId: string; resumeId?: string; studentNotes?: string }): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/applications', data);
    return response.data.data!;
  },

  // GET /api/v1/applications/me (student only)
  getMyApplications: async (params?: { page?: number; limit?: number }): Promise<{
    applications: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      applications: unknown[];
      meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
    }>(`/applications/me?${query.toString()}`);
    return response.data.data!;
  },

  // GET /api/v1/applications/jobs/:jobId/applications (company only)
  getJobApplications: async (jobId: string, params?: { page?: number; limit?: number }): Promise<{
    applications: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      applications: unknown[];
      meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
    }>(`/applications/jobs/${jobId}/applications?${query.toString()}`);
    return response.data.data!;
  },

  // PATCH /api/v1/applications/:id/status (company only)
  updateStatus: async (
    id: string,
    data: { status: string; notes?: string }
  ): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/applications/${id}/status`, data);
    return response.data.data!;
  },

  // PATCH /api/v1/applications/:id/notes (company only)
  addNotes: async (id: string, notes: string): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/applications/${id}/notes`, { recruiterNotes: notes });
    return response.data.data!;
  },

  // PATCH /api/v1/applications/:id/schedule-interview (company only)
  scheduleInterview: async (
    id: string,
    data: {
      scheduledAt: string;
      duration: number;
      type: string;
      location?: string;
      meetingLink?: string;
      instructions?: string;
    }
  ): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/applications/${id}/schedule-interview`, data);
    return response.data.data!;
  },

  // PATCH /api/v1/applications/:id/offer (company only)
  extendOffer: async (
    id: string,
    data: {
      role: string;
      compensation: { min?: number; max?: number; currency: string; isNegotiable: boolean };
      joiningDate: string;
      location?: string;
    }
  ): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/applications/${id}/offer`, data);
    return response.data.data!;
  },
};

export const resumeApi = {
  // POST /api/v1/resumes/upload
  upload: async (file: File): Promise<unknown> => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await apiClient.post<unknown>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  // GET /api/v1/resumes
  getAll: async (): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>('/resumes');
    return response.data.data!;
  },

  // DELETE /api/v1/resumes/:id
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<unknown>(`/resumes/${id}`);
    return { message: response.data.message };
  },

  // PATCH /api/v1/resumes/:id/primary
  setPrimary: async (id: string): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/resumes/${id}/primary`);
    return response.data.data!;
  },
};

export const notificationApi = {
  getNotifications: async (params?: { category?: string; priority?: string; unreadOnly?: boolean; search?: string; page?: number; limit?: number }): Promise<{
    notifications: unknown[];
    unreadCount: number;
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.unreadOnly) query.set('unreadOnly', String(params.unreadOnly));
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      notifications: unknown[];
      unreadCount: number;
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(`/notifications?${query.toString()}`);
    return response.data.data!;
  },

  getPreferences: async (): Promise<unknown> => {
    const response = await apiClient.get<unknown>('/notifications/preferences');
    return response.data.data!;
  },

  updatePreferences: async (updates: unknown): Promise<unknown> => {
    const response = await apiClient.patch<unknown>('/notifications/preferences', updates);
    return response.data.data!;
  },

  markAsRead: async (id: string): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/notifications/${id}/read`);
    return response.data.data!;
  },

  markAsUnread: async (id: string): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/notifications/${id}/unread`);
    return response.data.data!;
  },

  deleteNotification: async (id: string): Promise<unknown> => {
    const response = await apiClient.delete<unknown>(`/notifications/${id}`);
    return response.data.data!;
  },

  markAllAsRead: async (): Promise<unknown> => {
    const response = await apiClient.patch<unknown>('/notifications/read-all');
    return response.data.data!;
  },

  bulkAction: async (ids: string[], action: 'mark-read' | 'mark-unread' | 'delete'): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/notifications/bulk', { ids, action });
    return response.data.data!;
  },
};

export const auditApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<{ logs: unknown[]; meta: unknown }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{ logs: unknown[]; meta: unknown }>(`/analytics/audit-logs?${query.toString()}`);
    return response.data.data || { logs: [], meta: {} };
  },
};

export const analyticsApi = {
  // GET /api/v1/analytics/me
  getStudentStats: async (): Promise<StudentAnalytics> => {
    const response = await apiClient.get<StudentAnalytics>('/analytics/me');
    return response.data.data!;
  },

  // GET /api/v1/analytics/company/:id/stats
  getCompanyStats: async (companyId?: string): Promise<CompanyAnalytics> => {
    const endpoint = companyId ? `/analytics/company/${companyId}/stats` : '/analytics/company/stats';
    const response = await apiClient.get<CompanyAnalytics>(endpoint);
    return response.data.data!;
  },

  // GET /api/v1/analytics/drive/:driveId/stats
  getDriveStats: async (driveId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/analytics/drive/${driveId}/stats`);
    return response.data.data!;
  },

  // GET /api/v1/analytics (admin only)
  getAdminAnalytics: async (): Promise<AdminAnalytics> => {
    const response = await apiClient.get<AdminAnalytics>('/analytics');
    return response.data.data!;
  },
};

export const driveApi = {
  getAll: async (params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<{
    items: Record<string, unknown>[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    const response = await apiClient.get<{
      drives: Record<string, unknown>[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(`/drives?${query.toString()}`);
    return {
      items: response.data.data?.drives || [],
      meta: response.data.data?.meta || {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  getById: async (id: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>(`/drives/${id}`);
    return response.data.data!;
  },

  create: async (data: unknown): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>('/drives', data);
    return response.data.data!;
  },

  update: async (id: string, data: unknown): Promise<Record<string, unknown>> => {
    const response = await apiClient.patch<Record<string, unknown>>(`/drives/${id}`, data);
    return response.data.data!;
  },

  submitForApproval: async (id: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(`/drives/${id}/submit`);
    return response.data.data!;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/drives/${id}`);
    return { message: response.data.message };
  },

  checkEligibility: async (driveId: string): Promise<{ eligible: boolean }> => {
    const response = await apiClient.get<{ eligible: boolean }>(`/drives/${driveId}/eligibility`);
    return response.data.data!;
  },
};

export const aiApi = {
  // POST /api/v1/ai/analyze-resume
  analyzeResume: async (resumeId: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/ai/analyze-resume', { resumeId });
    return response.data.data!;
  },

  // POST /api/v1/ai/job-match
  getJobMatch: async (jobId: string, studentId?: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/ai/job-match', { jobId, studentId });
    return response.data.data!;
  },

  // POST /api/v1/ai/skill-gap
  getSkillGap: async (studentId?: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/ai/skill-gap', { studentId });
    return response.data.data!;
  },

  // POST /api/v1/ai/mock-interview
  startMockInterview: async (jobId: string, studentId?: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/ai/mock-interview', { jobId, studentId });
    return response.data.data!;
  },

  // POST /api/v1/ai/interview-prep
  getInterviewPrep: async (jobId: string, studentId?: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/ai/interview-prep', { jobId, studentId });
    return response.data.data!;
  },

  // POST /api/v1/ai/chat
  chat: async (messages: Array<{ role: string; content: string }>, context?: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/ai/chat', { messages, context });
    return response.data.data!;
  },
};

export const interviewApi = {
  // GET /api/v1/interviews/me (student)
  getMyInterviews: async (): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>('/interviews/me');
    return response.data.data!;
  },

  // GET /api/v1/interviews/company (company)
  getCompanyInterviews: async (): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>('/interviews/company');
    return response.data.data!;
  },

  // GET /api/v1/interviews (admin)
  getAll: async (params?: { page?: number; limit?: number }): Promise<{
    interviews: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      interviews: unknown[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(`/interviews?${query.toString()}`);
    return response.data.data!;
  },

  // POST /api/v1/interviews (company)
  schedule: async (data: unknown): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/interviews', data);
    return response.data.data!;
  },

  // PATCH /api/v1/interviews/:id/status
  updateStatus: async (id: string, data: { status: string; feedback?: string }): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/interviews/${id}/status`, data);
    return response.data.data!;
  },
};

export const atsApi = {
  // POST /api/v1/ats/analyze
  analyze: async (data: { resumeId: string; targetJobId?: string; customJobDescription?: string; targetRole?: string }): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/ats/analyze', data);
    return response.data.data!;
  },

  // GET /api/v1/ats/analyses
  getAnalyses: async (): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>('/ats/analyses');
    return response.data.data!;
  },

  // GET /api/v1/ats/history
  getHistory: async (): Promise<Array<{ id: string; version: number; score: number; targetRole: string; date: string }>> => {
    const response = await apiClient.get<Array<{ id: string; version: number; score: number; targetRole: string; date: string }>>('/ats/history');
    return response.data.data!;
  },

  // GET /api/v1/ats/analyses/:id
  getAnalysisById: async (id: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/ats/analyses/${id}`);
    return response.data.data!;
  },

  // POST /api/v1/ats/compare
  compare: async (analysisId1: string, analysisId2: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/ats/compare', { analysisId1, analysisId2 });
    return response.data.data!;
  },
};

export const tpoApi = {
  getStats: async (): Promise<unknown> => {
    const response = await apiClient.get<unknown>('/tpo/stats');
    return response.data.data!;
  },

  getStudents: async (params?: Record<string, unknown>): Promise<{ students: unknown[]; total: number }> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
      });
    }
    const response = await apiClient.get<{ students: unknown[]; total: number }>(`/tpo/students?${query.toString()}`);
    return response.data.data!;
  },

  getAnalytics: async (): Promise<unknown> => {
    const response = await apiClient.get<unknown>('/tpo/analytics');
    return response.data.data!;
  },
};

export const assessmentApi = {
  create: async (data: Record<string, unknown>): Promise<unknown> => {
    const response = await apiClient.post<unknown>('/assessments', data);
    return response.data.data!;
  },

  getAll: async (): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>('/assessments');
    return response.data.data!;
  },

  getById: async (id: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/assessments/${id}`);
    return response.data.data!;
  },

  start: async (id: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>(`/assessments/${id}/start`);
    return response.data.data!;
  },

  autosave: async (id: string, payload: Record<string, unknown>): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/assessments/${id}/autosave`, payload);
    return response.data.data!;
  },

  runCode: async (id: string, payload: { questionId: string; language?: string; sourceCode: string }): Promise<unknown> => {
    const response = await apiClient.post<unknown>(`/assessments/${id}/run`, payload);
    return response.data.data!;
  },

  submit: async (id: string, payload: { codeSnapshots?: Record<string, string>; answers?: Record<string, unknown> }): Promise<unknown> => {
    const response = await apiClient.post<unknown>(`/assessments/${id}/submit`, payload);
    return response.data.data!;
  },

  getResult: async (id: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/assessments/${id}/result`);
    return response.data.data!;
  },

  getCandidates: async (id: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(`/assessments/${id}/candidates`);
    return response.data.data!;
  },
};

export const intelligenceApi = {
  // GET /api/v1/intelligence/readiness
  getReadiness: async (): Promise<{
    overallScore: number;
    label: 'STRONG' | 'DEVELOPING' | 'NEEDS_WORK';
    method: string;
    dimensions: {
      resume: number;
      atsScore: number;
      skills: number;
      projects: number;
      academics: number;
      assessments: number;
      applications: number;
      profile: number;
    };
    weakest: Array<{ key: string; score: number; weight: number }>;
    strongest: Array<{ key: string; score: number }>;
    positiveFactors: string[];
    risks: string[];
    recommendedActions: string[];
    dataTimestamp: string;
  }> => {
    const response = await apiClient.get<any>('/intelligence/readiness');
    return response.data.data;
  },

  // POST /api/v1/intelligence/snapshot
  forceSnapshot: async (): Promise<{ overallScore: number; snapshotAt: string }> => {
    const response = await apiClient.post<any>('/intelligence/snapshot');
    return response.data.data;
  },

  // POST /api/v1/intelligence/job-match
  getJobMatch: async (jobId: string, studentUserId?: string): Promise<{
    jobId: string;
    jobTitle: string;
    matchScore: number;
    applicationPriority: 'HIGH' | 'MEDIUM' | 'LOW';
    eligible: boolean;
    method: string;
    breakdown: {
      skillOverlap: number;
      cgpaScore: number;
      projectRelevance: number;
      departmentMatch: number;
    };
    matchedSkills: string[];
    missingSkills: string[];
    missingRequiredSkills: string[];
    positiveFactors: string[];
    risks: string[];
  }> => {
    const response = await apiClient.post<any>('/intelligence/job-match', { jobId, studentUserId });
    return response.data.data;
  },

  // GET /api/v1/intelligence/job-recommendations
  getJobRecommendations: async (limit = 5): Promise<{
    recommendations: Array<{
      jobId: string;
      title: string;
      location?: string;
      employmentType?: string;
      compensation?: { min?: number; max?: number; currency?: string };
      applicationDeadline?: string;
      matchScore: number;
      eligible: boolean;
      missingSkills: string[];
      applicationPriority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    method: string;
    totalJobsEvaluated: number;
  }> => {
    const response = await apiClient.get<any>(`/intelligence/job-recommendations?limit=${limit}`);
    return response.data.data;
  },

  // POST /api/v1/intelligence/candidate-ranking
  getCandidateRanking: async (jobId: string): Promise<{
    jobId: string;
    jobTitle: string;
    totalCandidates: number;
    candidates: Array<{
      rank: number;
      applicationId: string;
      student: {
        id: string;
        userId: string;
        department?: string;
        course?: string;
        cgpa?: number;
        skills?: string[];
      };
      fitScore: number;
      applicationStatus: string;
      appliedAt: string;
      breakdown: {
        skillOverlap: number;
        cgpaScore: number;
        atsScore: number;
        assessmentScore: number;
        projectRelevance: number;
      };
      matchedSkills: string[];
      missingSkills: string[];
      positiveFactors: string[];
      concerns: string[];
      method: string;
    }>;
    method: string;
    scoringWeights: Record<string, number>;
    fairnessNote: string;
  }> => {
    const response = await apiClient.post<any>('/intelligence/candidate-ranking', { jobId });
    return response.data.data;
  },

  // GET /api/v1/intelligence/skill-gap
  getSkillGap: async (targetJobId?: string): Promise<{
    studentSkills: string[];
    context: string;
    demandedSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
    coverageScore: number;
    priorityGaps: string[];
    method: string;
  }> => {
    const query = targetJobId ? `?targetJobId=${targetJobId}` : '';
    const response = await apiClient.get<any>(`/intelligence/skill-gap${query}`);
    return response.data.data;
  },

  // GET /api/v1/intelligence/learning-plan
  getLearningPlan: async (): Promise<{
    title: string;
    skillCoverageScore: number;
    priorityGaps: string[];
    plan: Array<{ day: number; topic: string; type: string; hours: number }>;
    weakAreas: string[];
    method: string;
    generatedAt: string;
  }> => {
    const response = await apiClient.get<any>('/intelligence/learning-plan');
    return response.data.data;
  },

  // GET /api/v1/intelligence/tpo-forecast
  getTPOForecast: async (): Promise<{
    forecast: {
      totalStudents: number;
      placedStudents: number;
      currentPlacementRate: number;
      projectedPlacementRate: number;
      atRiskCount: number;
      totalApplications: number;
      method: string;
      confidence: string;
      disclaimer: string;
    };
    atRisk: {
      total: number;
      students: Array<{
        id: string;
        department?: string;
        cgpa?: number;
        readinessIndex?: number;
        placementStatus?: string;
        riskFactors: string[];
      }>;
      method: string;
    };
    skillDemandGap: {
      skillGaps: Array<{
        skill: string;
        jobCount: number;
        studentCount: number;
        demandRate: number;
        supplyRate: number;
        gapScore: number;
      }>;
      totalJobsAnalyzed: number;
      totalStudentsAnalyzed: number;
      method: string;
    };
  }> => {
    const response = await apiClient.get<any>('/intelligence/tpo-forecast');
    return response.data.data;
  },
};

export type { User };

