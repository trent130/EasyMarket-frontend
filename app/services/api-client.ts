import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

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


apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure headers is initialized and has correct type
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }

    // Modify the URL to include parameters
    if (config.url) {
      config.url = buildURLWithParams(config.url, config.params as Record<string, string | number>);
      delete config.params; // Remove params from config, as they are now in the URL
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor: Handle 401 and Refresh Tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an invalid token (401) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, force login
          // window.location.href = '/auth/signin';
          return Promise.reject(error);
        }
        
        // Try to get a new token
        const response = await apiClient.post('/marketplace/api/token/refresh/', {
          refresh: refreshToken
        });
        
        // Store the new token
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        // Update the failed request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        handleLogout()
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Utility: Handle Logout
function handleLogout() {
    // Prevent infinite reload
    if (window.location.pathname === '/auth/signin') return;
  
    // Clear storage and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth/signin';
  }
  


export default apiClient;