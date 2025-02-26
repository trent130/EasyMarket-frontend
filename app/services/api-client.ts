import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

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

// Helper function to append query parameters to a URL
function buildURLWithParams(url: string, params?: Record<string, string | number>): string {
  const urlObj = new URL(url, apiClient.defaults.baseURL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, String(value));
    });
  }
  return urlObj.toString();
}

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

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

// Add request interceptor for debugging and token
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Modify the URL to include parameters
    if (config.url) {
      config.url = buildURLWithParams(config.url, config.params as Record<string, string | number>);
      delete config.params; // Remove params from config, as they are now in the URL
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          handleLogout();
          return Promise.reject(error);
        }
        
        // Use the separate client to avoid interceptor loops
        const response = await tokenRefreshClient.post('/marketplace/token/refresh/', {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        // Update the token in the original request
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        // Process any queued requests with the new token
        processQueue(null, access);
        isRefreshing = false;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleLogout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Utility: Handle Logout
function handleLogout() {
  // Check if we're on the client side
  if (typeof window === 'undefined') return;
  
  // Prevent infinite reload
  if (window.location.pathname === '/auth/signin') return;
  
  // Clear storage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user_id');
  localStorage.removeItem('email');
  
  // Redirect to sign-in page
  window.location.href = '/auth/signin';
}

export default apiClient;