import apiClient from '../api/apiClient';
import type { User, AuthResponse, RefreshResponse } from '../../types';
import { getStorage, removeStorage, setStorage } from '../api/storage';
import { STORAGE_KEYS } from '../../constants';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'COMPANY';
  studentId?: string;
  department?: string;
  course?: string;
  graduationYear?: number;
  companyName?: string;
  industry?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  otp: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    const result = response.data.data!;
    return result;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    const result = response.data.data!;
    return result;
  },

  async googleLogin(credential: string, role: 'STUDENT' | 'COMPANY' = 'STUDENT'): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', { credential, role });
    const result = response.data.data!;
    return result;
  },

  async phoneLogin(idToken: string, phoneNumber: string, role: 'STUDENT' | 'COMPANY' = 'STUDENT'): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/phone', { idToken, phoneNumber, role });
    const result = response.data.data!;
    return result;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors during logout
    }
  },

  async refreshAccessToken(): Promise<RefreshResponse> {
    const response = await apiClient.post<RefreshResponse>('/auth/refresh');
    const result = response.data.data!;
    return result;
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return response.data.data!;
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data.data!;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data!;
  },

  async getMe(userId: string): Promise<{ user: User; profile: unknown }> {
    const response = await apiClient.get<{ user: User; profile: unknown }>('/auth/me');
    return response.data.data!;
  },

  getStoredUser(): User | null {
    const userData = getStorage(STORAGE_KEYS.USER_DATA);
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch {
        return null;
      }
    }
    return null;
  },

  getStoredAccessToken(): string | null {
    return getStorage(STORAGE_KEYS.ACCESS_TOKEN);
  },

  clearAuth(): void {
    removeStorage(STORAGE_KEYS.ACCESS_TOKEN);
    removeStorage(STORAGE_KEYS.USER_DATA);
  },
};
