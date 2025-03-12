import apiClient, { STORAGE_KEYS, clearAuthData, setAuthToken } from '../api-client';
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
    Order,
    Category,
    Product,
    ApiResponse
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
 * Ensures data is always returned as an array
 * This helps prevent "map is not a function" errors
 */
const ensureArray = <T>(data: T | T[] | null | undefined): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
};

/**
 * API Service - Centralized API interaction layer
 */
export const apiService = {
    // Auth endpoints
    auth: {
        login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
            try {
                console.log('Sending login request with credentials:', {
                    ...credentials,
                    password: credentials.password ? '********' : undefined
                });
                
                // Try different possible login endpoints
                let response;
                try {
                    // First try the endpoint from the Django URLs
                    response = await apiClient.post<AuthTokens>('/marketplace/signin/', credentials);
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        // Try alternative endpoint
                        console.log('Trying alternative login endpoint: /marketplace/token/');
                        response = await apiClient.post<AuthTokens>('/marketplace/token/', credentials);
                    } else {
                        throw err;
                    }
                }
                
                const data = response.data;
                
                console.log('Login response:', {
                    ...data,
                    token: data.token ? '[REDACTED]' : undefined,
                    access: data.access ? '[REDACTED]' : undefined,
                    refresh: data.refresh ? '[REDACTED]' : undefined,
                    refreshToken: data.refreshToken ? '[REDACTED]' : undefined
                });
                
                // Validate response
                if (!data?.token && !data?.access) {
                    throw new Error('Invalid authentication response from server');
                }
                
                // Store tokens securely
                const token = data.token || data.access;
                const refreshToken = data.refreshToken || data.refresh;
                
                if (token) {
                    setAuthToken(token);
                }
                
                if (refreshToken) {
                    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
                }
                
                return data;
            } catch (error) {
                console.error('Login API error:', error);
                return handleApiError(error);
            }
        },
        
        logout: async (): Promise<void> => {
            try {
                // Call backend logout endpoint
                await apiClient.post('/marketplace/logout/');
            } catch (error) {
                console.error('Logout API error:', error);
            } finally {
                // Always clear auth data regardless of API success
                clearAuthData();
            }
        },
        
        register: async (userData: any): Promise<any> => {
            try {
                const response = await apiClient.post('/marketplace/signup/', userData);
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
            try {
                const response = await apiClient.post('/marketplace/token/refresh/', { refresh: refreshToken });
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        verifyToken: async (token: string): Promise<{ valid: boolean }> => {
            try {
                // There's no explicit token verify endpoint in the URLs, so we'll use a profile endpoint
                // to check if the token is valid
                await apiClient.get('/marketplace/api/profile/');
                return { valid: true };
            } catch (error) {
                return { valid: false };
            }
        },
        
        forgotPassword: async (email: string): Promise<any> => {
            try {
                const response = await apiClient.post('/marketplace/forgot_password/', { email });
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        resetPassword: async (data: { token: string; password: string }): Promise<any> => {
            try {
                const response = await apiClient.post('/marketplace/reset_password', data);
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        }
    },
    
    // User related endpoints
    user: {
        getProfile: async (): Promise<User> => {
            try {
                // Try the correct profile endpoint from the Django URLs
                try {
                    const response = await apiClient.get('/marketplace/api/profile/');
                    return response.data;
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        // Try alternative endpoint
                        const altResponse = await apiClient.get('/marketplace/api/profile/me/');
                        return altResponse.data;
                    }
                    throw err;
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                // Return a minimal user object based on stored data
                if (typeof window !== 'undefined') {
                    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
                    if (storedUser) {
                        try {
                            return JSON.parse(storedUser);
                        } catch (e) {
                            console.error('Failed to parse stored user data:', e);
                        }
                    }
                }
                return handleApiError(error);
            }
        },
        
        updateProfile: async (userData: Partial<User>): Promise<User> => {
            try {
                const response = await apiClient.put('/marketplace/api/profile/', userData);
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        changePassword: async (data: { current_password: string; new_password: string }): Promise<void> => {
            try {
                await apiClient.post('/marketplace/user/change-password/', data);
            } catch (error) {
                return handleApiError(error);
            }
        }
    },
    
    // Two-factor authentication endpoints
    twoFactor: {
        getStatus: async (): Promise<TwoFactorStatusResponse> => {
            try {
                const response = await apiClient.get('/marketplace/2fa-status/');
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        enable: async (): Promise<TwoFactorAuthResponse> => {
            try {
                const response = await apiClient.post('/marketplace/enable-2fa/');
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        verify: async (token: string): Promise<TwoFactorVerifyResponse> => {
            try {
                const response = await apiClient.post('/marketplace/verify-2fa/', { token });
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        disable: async (token: string): Promise<TwoFactorVerifyResponse> => {
            try {
                const response = await apiClient.post('/marketplace/disable-2fa/', { token });
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        validate: async (token: string): Promise<TwoFactorVerifyResponse> => {
            try {
                const response = await apiClient.post('/marketplace/validate-2fa/', { token });
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        regenerateBackupCodes: async (): Promise<any> => {
            try {
                const response = await apiClient.post('/marketplace/regenerate-2-fa/');
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        }
    },

    // Product related endpoints
    products: {
        getList: async (params?: Record<string, string | number>): Promise<Product[]> => {
            try {
                const response = await apiClient.get('/marketplace/api/search/', { params });
                // Ensure we always return an array of products
                const products = response.data?.results || response.data?.data || response.data;
                return ensureArray(products);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        getDetail: async (id: string): Promise<Product> => {
            try {
                const response = await apiClient.get(`/marketplace/api/products/${id}`);
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        create: async (data: Partial<Product>): Promise<Product> => {
            try {
                const response = await apiClient.post('/marketplace/api/products', data);
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        getReviews: async (productId: string): Promise<any[]> => {
            try {
                const response = await apiClient.get(`/marketplace/api/products/${productId}/reviews/`);
                return ensureArray(response.data?.results || response.data);
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        addReview: async (productId: string, reviewData: any): Promise<any> => {
            try {
                const response = await apiClient.post(`/marketplace/api/products/${productId}/reviews/`, reviewData);
                return response.data;
            } catch (error) {
                return handleApiError(error);
            }
        }
    },

    // Category related endpoints
    categories: {
        getList: async (): Promise<Category[]> => {
            try {
                // There's no explicit categories endpoint in the URLs, so we might need to
                // extract categories from products or use a different approach
                const response = await apiClient.get('/marketplace/api/search/', { params: { category: true } });
                
                // Debug the response to see what's coming back
                console.log('Categories response:', response.data);
                
                // Handle different response formats
                let categories;
                if (response.data?.categories) {
                    categories = response.data.categories;
                } else if (response.data?.results) {
                    categories = response.data.results;
                } else if (response.data?.data) {
                    categories = response.data.data;
                } else if (Array.isArray(response.data)) {
                    categories = response.data;
                } else if (typeof response.data === 'object') {
                    // If it's an object but not an array, try to extract values
                    categories = Object.values(response.data);
                } else {
                    categories = [];
                }
                
                // Ensure it's an array
                if (!Array.isArray(categories)) {
                    console.error('Categories is not an array:', categories);
                    return [];
                }
                
                return categories;
            } catch (error) {
                console.error('Error fetching categories:', error);
                return []; // Return empty array instead of throwing
            }
        },
        
        getDetail: async (id: string): Promise<Category> => {
            try {
                const response = await apiClient.get(`/marketplace/api/search/`, { params: { category: id } });
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        }
    },

    // Cart related endpoints
    cart: {
        get: async (): Promise<any> => {
            try {
                const response = await apiClient.get('/marketplace/api/cart/');
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        addItem: async (cartId: string, data: any): Promise<any> => {
            try {
                const response = await apiClient.post(`/marketplace/api/cart/${cartId}/add/`, data);
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        removeItem: async (cartId: string, data: any): Promise<any> => {
            try {
                const response = await apiClient.post(`/marketplace/api/cart/${cartId}/remove/`, data);
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        clear: async (cartId: string): Promise<void> => {
            try {
                await apiClient.post(`/marketplace/api/cart/${cartId}/clear/`);
            } catch (error) {
                return handleApiError(error);
            }
        }
    },
    
    // Wishlist related endpoints
    wishlist: {
        get: async (): Promise<any> => {
            try {
                const response = await apiClient.get('/marketplace/api/wishlist/');
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        addProduct: async (wishlistId: string, data: any): Promise<any> => {
            try {
                const response = await apiClient.post(`/marketplace/api/wishlist/${wishlistId}/add/`, data);
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        },
        
        removeProduct: async (wishlistId: string, data: any): Promise<any> => {
            try {
                const response = await apiClient.post(`/marketplace/api/wishlist/${wishlistId}/remove/`, data);
                return response.data?.data || response.data;
            } catch (error) {
                return handleApiError(error);
            }
        }
    },
    
    // Search and recommendations
    search: async (query: string): Promise<any[]> => {
        try {
            const response = await apiClient.get('/marketplace/api/search/', { params: { q: query } });
            return ensureArray(response.data?.results || response.data);
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    getRecommendations: async (): Promise<any[]> => {
        try {
            const response = await apiClient.get('/marketplace/api/recommendations/');
            return ensureArray(response.data?.results || response.data);
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Convenience methods for 2FA
    get2FAStatus: async (): Promise<TwoFactorStatusResponse> => {
        return apiService.twoFactor.getStatus();
    },
    
    enable2FA: async (): Promise<TwoFactorAuthResponse> => {
        return apiService.twoFactor.enable();
    },
    
    verify2FASetup: async (token: string): Promise<TwoFactorVerifyResponse> => {
        return apiService.twoFactor.verify(token);
    },
    
    disable2FA: async (token: string): Promise<TwoFactorVerifyResponse> => {
        return apiService.twoFactor.disable(token);
    },
    
    validate2FAToken: async (token: string): Promise<TwoFactorVerifyResponse> => {
        return apiService.twoFactor.validate(token);
    },
    
    // Convenience methods for auth
    login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
        return apiService.auth.login(credentials);
    },
    
    logout: async (): Promise<void> => {
        return apiService.auth.logout();
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
    }
};