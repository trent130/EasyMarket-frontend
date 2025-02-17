import apiClient from '../api-client';
import { Product } from '../../types/common';
import { Cart } from '@/types/api';

export const cartApi = {
    getCart: (): Promise<Cart> =>
        apiClient.get<Cart>('/marketplace/api/cart').then(response => response.data),

    addItem: (productId: number, quantity: number): Promise<Cart> =>
        apiClient.post<Cart>(`/marketplace/api/cart/${productId}/add/`, { productId, quantity }).then(response => response.data), // to be implemented this one

    updateItem: (itemId: number, quantity: number): Promise<Cart> =>
        apiClient.put<Cart>(`/marketplace/api/cart/items/${itemId}/update/`, { quantity }).then(response => response.data),

    removeItem: (itemId: number): Promise<void> => // Assuming no response data needed
        apiClient.delete<void>(`/marketplace/api/cart/${itemId}/remove/`).then(() => {}),

    clearCart: (): Promise<void> => // Assuming no response data needed
        apiClient.post<void>('/marketplace/api/clear', {}).then(() => {}) // to be added in the cart functionalities in the backend
};

export type CartApi = typeof cartApi;