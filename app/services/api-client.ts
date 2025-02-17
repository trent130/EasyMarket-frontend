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
            config.headers['Authorization'] = `Bearer ${token}`;
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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.warn('No refresh token. Redirecting to login.');
                handleLogout();
                return Promise.reject(error);
            }

            try {
                const response = await axios.post<{ access: string }>(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/marketplace/api/token/refresh/`,
                    { refresh: refreshToken }
                );

                const { access } = response.data;
                localStorage.setItem('token', access);

                // Retry original request
                originalRequest.headers['Authorization'] = `Bearer ${access}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed. Redirecting to login.', refreshError);
                handleLogout();
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