import apiClient from '../api-client';
import { API_CONFIG } from './config';
import { ApiError } from '@/types/api';
import { Product } from '@/types/product';

interface CreateProductData {
  title: string;
  description: string;
  price: number;
  category: number;
  condition: string;
  images: string[];
  in_stock: boolean;
}

interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

export const myProductsApi = {
  getMyProducts: async (params?: {
    status?: 'active' | 'sold' | 'draft';
    page?: number;
    limit?: number;
  }): Promise<{
    results: Product[];
    total: number;
    page: number;
  }> => {
    try {
      const response = await apiClient.get<{
        results: Product[];
        total: number;
        page: number;
      }>('/marketplace/my-products/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createProduct: async (data: CreateProductData): Promise<Product> => {
    try {
      const response = await apiClient.post<Product>('/marketplace/my-products/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateProduct: async (data: UpdateProductData): Promise<Product> => {
    try {
      const response = await apiClient.patch<Product>(`/marketplace/my-products/${data.id}/`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteProduct: async (productId: number): Promise<void> => {
    try {
      await apiClient.delete<void>(`/marketplace/my-products/${productId}/`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateProductStatus: async (productId: number, status: 'active' | 'sold' | 'draft'): Promise<Product> => {
    try {
      const response = await apiClient.patch<Product>(`/marketplace/my-products/${productId}/status/`, {
        status
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  uploadProductImage: async (productId: number, imageFile: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.post<{ url: string }>(
        `/marketplace/my-products/${productId}/images/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteProductImage: async (productId: number, imageUrl: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/marketplace/my-products/${productId}/images/`, {
        data: { image_url: imageUrl }
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

const handleApiError = (error: unknown): never => {
  const apiError: ApiError = {
    message: 'An error occurred',
    status: 500
  };

  if (isApiError(error)) {
    apiError.message = error.response?.data?.message || 'An error occurred';
    apiError.status = error.response?.status || 500;
  }

  throw apiError;
};

const isApiError = (error: unknown): error is { response?: { data?: { message?: string }; status?: number } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
}; 