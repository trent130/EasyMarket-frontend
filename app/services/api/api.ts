import apiClient from '../api-client';

// API service methods
export const apiService = {
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