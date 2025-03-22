import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Cache } from '../utils/cache';

// Storage keys for consistency
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user'
};

// Extend AxiosRequestConfig to include retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  retried?: boolean;
}

// Create a separate instance for token refresh to avoid interceptor loops
const tokenRefreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Cache instance for API responses
const apiCache = new Cache<AxiosResponse>({
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
});

// Request deduplication map
const pendingRequests = new Map<string, Promise<AxiosResponse>>();

// Generate a cache key from request config
const getCacheKey = (config: AxiosRequestConfig): string => {
  const { method = 'get', url = '', params = {}, data = {} } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

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

// Request interceptor for caching and deduplication
apiClient.interceptors.request.use(async (config) => {
  const cacheKey = getCacheKey(config);

  // Skip cache for non-GET requests
  if (config.method?.toLowerCase() !== 'get') {
    return config;
  }

  // Check cache first
  const cachedResponse = apiCache.get<AxiosResponse>(cacheKey);
  if (cachedResponse) {
    return Promise.reject({
      config,
      response: cachedResponse,
      isCache: true,
    });
  }

  // Check for pending requests
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    return Promise.reject({
      config,
      response: await pendingRequest,
      isPending: true,
    });
  }

  // Always get the latest token for each request
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return config;
});

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => {
    const cacheKey = getCacheKey(response.config);

    // Cache GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      apiCache.set(cacheKey, response);
      pendingRequests.delete(cacheKey);
    }

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

// Response interceptor for caching successful responses
apiClient.interceptors.response.use(
  (response) => {
    const cacheKey = getCacheKey(response.config);

    // Cache GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      apiCache.set(cacheKey, response);
      pendingRequests.delete(cacheKey);
    }

    return response;
  },
  async (error: AxiosError) => {
    // Handle cached responses
    if (error.response && (error as any).isCache) {
      return error.response;
    }

    // Handle pending requests
    if (error.response && (error as any).isPending) {
      return error.response;
    }

    // Implement retry logic for failed requests
    const config = error.config as ExtendedAxiosRequestConfig;
    if (config && !config.retried) {
      config.retried = true;
      config.timeout = config.timeout ? config.timeout * 2 : 5000;

      try {
        return await apiClient(config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;