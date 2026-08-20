import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse, ApiError as ApiErrorResponse, ValidationError } from '../../types';
import { getStorage, removeStorage, setStorage } from './storage';
import { STORAGE_KEYS } from '../../constants';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token = '') => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

type RefreshAccessTokenFn = () => Promise<{ accessToken: string }>;

class ApiClient {
  private client: AxiosInstance;
  private refreshAccessTokenFn: RefreshAccessTokenFn | null = null;

  constructor() {
    this.client = axios.create({
      baseURL,
      withCredentials: true,
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  setRefreshAccessToken(fn: RefreshAccessTokenFn) {
    this.refreshAccessTokenFn = fn;
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.normalizeError(error))
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                resolve: (token) => {
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  resolve(this.client(originalRequest));
                },
                reject: (err) => reject(err),
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            if (!this.refreshAccessTokenFn) {
              throw new Error('Refresh token function not set');
            }
            const result = await this.refreshAccessTokenFn();
            const newToken = result.accessToken;
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            processQueue(null, newToken);
            return this.client(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError as Error, '');
            removeStorage(STORAGE_KEYS.ACCESS_TOKEN);
            removeStorage(STORAGE_KEYS.USER_DATA);
            window.dispatchEvent(new Event('auth:logout'));
            return Promise.reject(this.normalizeError(refreshError));
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: unknown): ApiErrorResponse {
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response) {
        const data = response.data as {
          success?: boolean;
          message?: string;
          errors?: ValidationError[];
          code?: string;
          requestId?: string;
        };

        return {
          success: false,
          message: data?.message || error.message || 'An error occurred',
          code: data?.code || `HTTP_${response.status}`,
          errors: data?.errors,
          requestId: data?.requestId,
        } as ApiErrorResponse;
      }

      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Request timed out. Please check your connection and try again.',
          code: 'TIMEOUT',
        } as ApiErrorResponse;
      }

      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: "We couldn't connect to PlaceX. Check your connection and try again.",
          code: 'NETWORK_ERROR',
        } as ApiErrorResponse;
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    } as ApiErrorResponse;
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, config);
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data, config);
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data, config);
  }

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data, config);
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url, config);
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
