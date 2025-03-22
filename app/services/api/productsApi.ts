import apiClient from '../api-client';
import { Product } from '@/types/product';

export const productsApi = {
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/api/products/featured');
    return response.data;
  },

  getTrendingProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/api/products/trending');
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },
};

export type ProductsApi = typeof productsApi; 