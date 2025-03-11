import apiClient, { STORAGE_KEYS } from '../api-client';
import axios, { AxiosResponse, AxiosError } from "axios";
import { 
    LoginCredentials, 
    ApiError,
    TwoFactorAuthResponse,
    TwoFactorStatusResponse,
	TwoFactorVerifyResponse,
	// ForgotPasswordResponse,
	// SignUpResponse,
	// SignInResponse,
    AuthTokens,
    User,
    Order
} from '../../types/api';

/**
 * Formats API errors consistently
 */
const handleApiError = (error: unknown): never => {
  if (isApiError(error)) {
    const apiError: ApiError = {
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status || 500,
      code: error.response?.data?.code,
      details: error.response?.data?.details
    };
    throw apiError;
  }
  
  // For non-API errors
  throw {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: 500
  } as ApiError;
};

/**
 * Type guard for API errors
 */
const isApiError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

/**
 * API Service - Centralized API interaction layer
 */
export const apiService = {
    // Auth endpoints
    login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
      try {
        const response = await apiClient.post<AuthTokens>('/marketplace/signin/', credentials);
        const data = response.data;
        
        // Validate response
        if (!data?.token && !data?.access) {
          throw new Error('Invalid authentication response from server');
        }
        
        // Store tokens securely
        const token = data.token || data.access;
        const refreshToken = data.refreshToken || data.refresh;
        
        if (token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        
        return data;
      } catch (error) {
        return handleApiError(error);
      }
    },

    logout: async (): Promise<void> => {
      try {
        // Call logout endpoint if available
        await apiClient.post('/marketplace/signout/');
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with local logout even if API call fails
      } finally {
        // Clear local storage
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        // Clear auth header
        delete apiClient.defaults.headers.common['Authorization'];
      }
    },

    // User endpoints
    user: {
        getProfile: async (): Promise<User> => {
            try {
                const response = await apiClient.get<User>('/marketplace/user/profile/');
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        updateProfile: async (data: Partial<User>): Promise<User> => {
            try {
                const response = await apiClient.put<User>('/marketplace/profile/', data);
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        }
    },

    // 2FA endpoints
    enable2FA: async (): Promise<TwoFactorAuthResponse> => {
        try {
            const response = await apiClient.post<TwoFactorAuthResponse>('/marketplace/2fa/enable/');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    verify2FASetup: async (token: string): Promise<TwoFactorVerifyResponse> => {
        try {
            const response = await apiClient.post<TwoFactorVerifyResponse>('/marketplace/2fa/verify-setup/', { token });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    disable2FA: async (token: string): Promise<TwoFactorVerifyResponse> => {
        try {
            const response = await apiClient.post<TwoFactorVerifyResponse>('/marketplace/2fa/disable/', { token });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    validate2FAToken: async (token: string): Promise<TwoFactorVerifyResponse> => {
        try {
            const response = await apiClient.post<TwoFactorVerifyResponse>('/marketplace/2fa/validate/', { token });
            
            // If validation successful, update token
            if (response.data.success && response.data.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    get2FAStatus: async (): Promise<TwoFactorStatusResponse> => {
        try {
            const response = await apiClient.get<TwoFactorStatusResponse>('/marketplace/2fa/status/');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // Orders
    createOrder: async (orderData: Partial<Order>): Promise<Order> => {
        try {
            const response = await apiClient.post<Order>('/orders/', orderData);
            return response.data;
        } catch (error) {
            if (isApiError(error)) {
                throw handleApiError(error);
            } else {
                throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 }});
            }
        }
    },

    fetchOrders: async (): Promise<Order[]> => {
        try {
            const response = await apiClient.get<Order[]>('/orders/');
            return response.data;
        } catch (error) {
            if (isApiError(error)) {
                throw handleApiError(error);
            } else {
                throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 }});
            }
        }
    },

    // Product related endpoints
    products: {
        getList: (params?: Record<string, string | number>): Promise<any> => {
            return apiClient.get(`/products`, { params }).then(response => response.data)
        },
        getDetail: (id: string): Promise<any> => apiClient.get(`/products/${id}`).then(response => response.data), // Replace 'any' with the correct type
        create: (data: any): Promise<any> => apiClient.post('/products', data).then(response => response.data) // Replace 'any' with the correct type
    },

    // Cart related endpoints
    cart: {
        get: (): Promise<any> => apiClient.get('/cart').then(response => response.data), // Replace 'any' with the correct type
        addItem: (data: any): Promise<any> => apiClient.post('/cart/items', data).then(response => response.data), // Replace 'any' with the correct type
        updateItem: (id: string, data: any): Promise<any> => apiClient.put(`/cart/items/${id}`, data).then(response => response.data) // Replace 'any' with the correct type
    }
};