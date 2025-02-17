import apiClient from '../../lib/api-client';
import { AxiosResponse } from "axios";
import {
    Order,
    LoginCredentials,
    AuthTokens,
    ApiError
} from '../../types/api';

// Error handler
const handleApiError = (error: { response?: { data?: { message?: string }; status?: number } }): never => {
    const apiError: ApiError = {
        message: error.response?.data?.message || 'An error occurred',
        status: error.response?.status || 500
    };

    if (isApiError(error)) {
        apiError.message = error.response?.data?.message || 'An error occurred';
        apiError.status = error.response?.status || apiError.status;
    }
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
            const response = await apiClient.post<AuthTokens>('/token/', credentials);
            return response.data;
        } catch (error) {
            if (isApiError(error)) {
                throw handleApiError(error);
            } else {
                throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 });
            }
        }
    },

    refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
        try {
            const response = await apiClient.post<AuthTokens>('/token/refresh/', { refresh: refreshToken });
            return response.data;
        } catch (error) {
            if (isApiError(error)) {
                throw handleApiError(error);
            } else {
                throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 });
            }
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
                throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 });
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
                throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 });
            }
        }
    },

    // User related endpoints
    user: {
        getProfile: (): Promise<any> => apiClient.get('/user/profile').then(response => response.data), // Replace 'any' with the correct type
        updateProfile: (data: any): Promise<any> => apiClient.put('/user/profile', data).then(response => response.data) // Replace 'any' with the correct type
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