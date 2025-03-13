import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Storage keys for consistency
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user'
};

// Create a separate instance for token refresh to avoid interceptor loops
const tokenRefreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable sending cookies
});

// Create a flag to track refresh attempts
let isRefreshing = false;
// Store pending requests
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}> = [];

// Process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.config.headers['Authorization'] = `Bearer ${token}`;
      promise.resolve(apiClient(promise.config));
    }
  });
  failedQueue = [];
};

// Initialize auth headers from localStorage on client side
if (typeof window !== 'undefined') {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    tokenRefreshClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Add request interceptor to ensure token is included in every request
apiClient.interceptors.request.use(
  (config) => {
    // Always get the latest token for each request
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    
    // If the error is not 401 or we've already tried to refresh, reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Mark this request as retried
      originalRequest._retry = true;
    
    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }
    
    isRefreshing = true;
    
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
        throw new Error('No refresh token available');
        }
        
      const response = await tokenRefreshClient.post('/marketplace/token/refresh/', {
          refresh: refreshToken
        });

        const { access } = response.data;
      
      // Update tokens in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, access);

      // Update auth headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      tokenRefreshClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Process queued requests
      processQueue(null, access);

      // Return the original request with new token
        return apiClient(originalRequest);
      } catch (refreshError) {
      // Handle refresh failure
      processQueue(refreshError, null);
      
      // Clear auth data
      clearAuthData();
      
        return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Clears all authentication data from localStorage and removes auth headers
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  // Clear storage
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  
  // Clear auth headers
  delete apiClient.defaults.headers.common['Authorization'];
  delete tokenRefreshClient.defaults.headers.common['Authorization'];
  
  // Dispatch auth change event
  window.dispatchEvent(new Event('authChange'));
};

// Export a function to set the auth token programmatically
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    tokenRefreshClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export default apiClient;