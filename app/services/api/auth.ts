import apiClient from '../api-client';
import { API_CONFIG } from './config';
import { ApiError } from '@/types/api';

export interface TwoFactorAuthResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean;
  isVerified: boolean;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

export const twoFactorApi = {
  enable: async (): Promise<TwoFactorAuthResponse> => {
    const response = await apiClient.post<TwoFactorAuthResponse>('/marketplace/enable-2fa/');
    return response.data;
  },

  verify: async (token: string, secret: string): Promise<TwoFactorVerifyResponse> => {
    const response = await apiClient.post<TwoFactorVerifyResponse>('/marketplace/verify-2fa/', {
      token,
      secret,
    });
    return response.data;
  },

  getStatus: async (): Promise<TwoFactorStatusResponse> => {
    const response = await apiClient.get<TwoFactorStatusResponse>('/marketplace/2fa-status/');
    return response.data;
  },

  disable: async (): Promise<TwoFactorVerifyResponse> => {
    const response = await apiClient.post<TwoFactorVerifyResponse>('/marketplace/disable-2fa/');
    return response.data;
  },

  validateToken: async (token: string): Promise<TwoFactorVerifyResponse> => {
    const response = await apiClient.post<TwoFactorVerifyResponse>('/marketplace/validate-2fa/', {
      token,
    });
    return response.data;
  },
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.TOKEN, credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/marketplace/register/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    try {
      const response = await apiClient.post<{ access: string }>(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
        refresh: refreshToken
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    try {
      const response = await apiClient.get<AuthResponse['user']>('/marketplace/me/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateProfile: async (data: Partial<RegisterData>): Promise<AuthResponse['user']> => {
    try {
      const response = await apiClient.patch<AuthResponse['user']>('/marketplace/me/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

const handleApiError = (error: unknown): never => {
  const apiError: ApiError = {
    message: 'An error occurred',
    status: 500
  };

  if (isApiError(error)) {
    apiError.message = error.response?.data?.message || 'An error occurred';
    apiError.status = error.response?.status || 500;
  }

  throw apiError;
};

const isApiError = (error: unknown): error is { response?: { data?: { message?: string }; status?: number } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};