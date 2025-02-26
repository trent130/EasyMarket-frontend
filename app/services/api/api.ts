import apiClient from '../api-client';
import { AxiosResponse } from "axios";
import { 
    LoginCredentials, 
    ApiError,
    TwoFactorAuthResponse,
    TwoFactorStatusResponse,
	TwoFactorVerifyResponse,
	ForgotPasswordResponse,
	SignUpResponse,
	SignInResponse,
    AuthTokens,
    Order
} from '../../types/api';

// Error handler
const handleApiError = (error: { response?: { data?: { message?: string }; status?: number } }): never => {
  const apiError: ApiError = {
    message: error.response?.data?.message || 'An error occurred',
    status: error.response?.status || 500
  };
  throw apiError;
};

/**
 * Checks if an error is an ApiError.
 *
 * @param error - The error to check.
 * @returns True if the error is an ApiError, false otherwise.
 */
const isApiError = (error: unknown): error is { response?: { data?: { message?: string }; status?: number } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

export const apiService = {
    // Auth
    login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
      try {
        console.log("Attempting to login with:", credentials);
        const response = await apiClient.post<AuthTokens>('/marketplace/signin/', credentials);
        
        const data = response.data; // Store response.data in a variable
        console.log("Login response data:", data);
        
        if (!data?.token && !data?.access) {
          console.log("Response structure:", data);
          throw new Error('No token received from server');
        }
        
        return {
          token: data.token || data.access,
          refreshToken: data.refreshToken || data.refresh,
          user_id: data.user_id,
          email: data.email
        };
      } catch (error: any) {
        console.error("Login error details:", {
          error: error,
          response: error.response,
          data: error.response?.data,
          status: error.response?.status
        });

        if (error.response) {
          const message = error.response.data?.message || 'Server error';
          throw new Error(message);
        } else if (error.request) {
          throw new Error('No response from server');
        } else {
          throw new Error(error.message || 'An unexpected error occurred');
        }
      }
    },
    

    refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
        try {
            const response = await apiClient.post<{ access: string }>('/token/refresh/', { refresh: refreshToken });
            return response.data; 
        } catch (error) {
            if (isApiError(error)) {
                throw handleApiError(error);
            } else {
                throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 }});
            }
        }
    },

  enable2FA: async (): Promise<TwoFactorAuthResponse> => {
    const response = await apiClient.post<TwoFactorAuthResponse>(
      '/marketplace/enable-2fa/',
      {}
    );
    return response.data;
  },

  verify2FA: async (token: string, secret: string): Promise<TwoFactorVerifyResponse> => {
    const response = await apiClient.post<TwoFactorVerifyResponse>(
      '/marketplace/verify-2fa/',
      { token, secret }
    );
    return response.data;
  },

  get2FAStatus: async (): Promise<TwoFactorStatusResponse> => {
    const response = await apiClient.get<TwoFactorStatusResponse>(
      '/marketplace/2fa-status/'
    );
    return response.data;
  },

  disable2FA: async (): Promise<TwoFactorVerifyResponse> => {
    const response = await apiClient.post<TwoFactorVerifyResponse>(
      '/marketplace/disable-2fa/',
      {}
    );
    return response.data;
  },

  validate2FAToken: async (token: string): Promise<TwoFactorVerifyResponse> => {
    const response = await apiClient.post<TwoFactorVerifyResponse>(
      '/marketplace/validate-2fa/',
      { token }
    );
    return response.data;
  },
/**
 * Registers a new user with the provided username, email, and password.
 *
 * @param username - The username for the new account.
 * @param email - The email address associated with the new account.
 * @param password - The password for the new account.
 * @returns A Promise that resolves to a SignUpResponse containing a message.
 */
   signUp: async (username: string, email: string, password: string): Promise<SignUpResponse> => {
    const response = await apiClient.post<SignUpResponse>('/marketplace/signup/', {
        username,
        email,
        password,
    });
    return response.data;
  },

   /**
   * Sends an email with a link to reset the user's password.
   *
   * @param email - The email address associated with the account to reset the password for.
   * @returns A Promise that resolves to a ForgotPasswordResponse containing a message.
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/marketplace/forgot-password/', {
        email,
    });
    return response.data;
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

    // User related endpoints
    user: {
        getProfile: async (): Promise<any> => {
            const response = await apiClient.get('/marketplace/user/profile/');
            return response.data;
        },
        updateProfile: (data: any): Promise<any> => apiClient.put('/marketplace/profile', data).then(response => response.data) // Replace 'any' with the correct type
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