import apiClient from '../api-client';
import { API_CONFIG } from './config';
import { ApiError } from '@/types/api';
import { handleApiError } from '@/utils/errorHandling';

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
    avatar?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    preferences?: {
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
      privacy: {
        show_email: boolean;
        show_phone: boolean;
        show_address: boolean;
      };
      theme: 'light' | 'dark' | 'system';
      language: string;
    };
  };
}

interface UpdateProfileData extends Partial<RegisterData> {
  avatar?: File;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

interface UpdatePreferencesData {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    show_email?: boolean;
    show_phone?: boolean;
    show_address?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface UserSettings {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    show_email: boolean;
    show_phone: boolean;
    show_address: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
}

interface UpdateSettingsData {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: File;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    show_email?: boolean;
    show_phone?: boolean;
    show_address?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  language?: string;
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
      const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
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
      const response = await apiClient.get<AuthResponse['user']>(API_CONFIG.ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<AuthResponse['user']> => {
    try {
      const formData = new FormData();
      
      // Handle file upload for avatar
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      // Handle other profile data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'avatar' && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.patch<AuthResponse['user']>(
        API_CONFIG.ENDPOINTS.AUTH.ME,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updatePreferences: async (data: UpdatePreferencesData): Promise<AuthResponse['user']> => {
    try {
      const response = await apiClient.patch<AuthResponse['user']>(
        `${API_CONFIG.ENDPOINTS.AUTH.ME}/preferences/`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    try {
      await apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH.ME}/change-password/`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteAccount: async (password: string): Promise<void> => {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.AUTH.ME, {
        data: { password }
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/marketplace/password-reset/', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    try {
      await apiClient.post('/marketplace/password-reset/confirm/', {
        token,
        password
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getSettings: async (): Promise<UserSettings> => {
    try {
      const response = await apiClient.get<UserSettings>(`${API_CONFIG.ENDPOINTS.AUTH.ME}/settings/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateSettings: async (data: UpdateSettingsData): Promise<UserSettings> => {
    try {
      const formData = new FormData();

      // Handle file upload for avatar
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      // Handle other settings data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'avatar' && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.patch<UserSettings>(
        `${API_CONFIG.ENDPOINTS.AUTH.ME}/settings/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

const isApiError = (error: unknown): error is { response?: { data?: { message?: string }; status?: number } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};