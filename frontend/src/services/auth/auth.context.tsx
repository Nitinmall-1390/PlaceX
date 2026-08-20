import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from './auth.service';
import { getStorage, removeStorage, setStorage } from '../../services/api/storage';
import { STORAGE_KEYS } from '../../constants';
import { apiClient } from '../../services/api/apiClient';
import type { User } from '../../types';
import type { AuthState, RegisterData } from './auth.service';

apiClient.setRefreshAccessToken(async () => {
  return authService.refreshAccessToken();
});

const AuthContext = createContext<{
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  googleLogin: (credential: string, role?: 'STUDENT' | 'COMPANY') => Promise<void>;
  phoneLogin: (idToken: string, phoneNumber: string, role?: 'STUDENT' | 'COMPANY') => Promise<void>;
  setAuthSession: (sessionData: { user: User; accessToken: string }) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (user: User) => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getStorage(STORAGE_KEYS.ACCESS_TOKEN);
        const storedUser = authService.getStoredUser();

        if (storedToken && storedUser) {
          setAuth({
            user: storedUser,
            accessToken: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuth({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        setAuth({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      authService.clearAuth();
      setAuth({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const setAuthSession = (sessionData: { user: User; accessToken: string }) => {
    setStorage(STORAGE_KEYS.ACCESS_TOKEN, sessionData.accessToken);
    setStorage(STORAGE_KEYS.USER_DATA, JSON.stringify(sessionData.user));
    setAuth({
      user: sessionData.user,
      accessToken: sessionData.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setAuthSession(result);
  };

  const register = async (data: Record<string, unknown>) => {
    const result = await authService.register(data as unknown as RegisterData);
    setAuthSession(result);
  };

  const googleLogin = async (credential: string, role: 'STUDENT' | 'COMPANY' = 'STUDENT') => {
    const result = await authService.googleLogin(credential, role);
    setAuthSession(result);
  };

  const phoneLogin = async (idToken: string, phoneNumber: string, role: 'STUDENT' | 'COMPANY' = 'STUDENT') => {
    const result = await authService.phoneLogin(idToken, phoneNumber, role);
    setAuthSession(result);
  };

  const logout = async () => {
    await authService.logout();
    removeStorage(STORAGE_KEYS.ACCESS_TOKEN);
    removeStorage(STORAGE_KEYS.USER_DATA);
    setAuth({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshSession = async () => {
    try {
      const result = await authService.refreshAccessToken();
      setStorage(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken);
      setAuth((prev: AuthState) => ({
        ...prev,
        accessToken: result.accessToken,
        isLoading: false,
      }));
    } catch {
      removeStorage(STORAGE_KEYS.ACCESS_TOKEN);
      removeStorage(STORAGE_KEYS.USER_DATA);
      setAuth({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const updateUser = (user: User) => {
    setStorage(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    setAuth((prev: AuthState) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        register,
        googleLogin,
        phoneLogin,
        setAuthSession,
        logout,
        refreshSession,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
