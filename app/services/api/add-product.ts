import apiClient from '../api-client';
import { API_CONFIG } from './config';
import { ApiError } from '@/types/api';
import { Product } from '@/types/product';

interface ProductValidationResult {
  isValid: boolean;
  errors?: {
    [key: string]: string[];
  };
}

interface ProductDraft {
  id?: number;
  title: string;
  description: string;
  price: number;
  category: number;
  condition: string;
  images: string[];
  in_stock: boolean;
  draft: boolean;
}

export const addProductApi = {
  validateProduct: async (data: Partial<ProductDraft>): Promise<ProductValidationResult> => {
    try {
      const response = await apiClient.post<ProductValidationResult>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}validate/`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  saveDraft: async (data: ProductDraft): Promise<Product> => {
    try {
      const response = await apiClient.post<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}draft/`,
        { ...data, draft: true }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateDraft: async (id: number, data: Partial<ProductDraft>): Promise<Product> => {
    try {
      const response = await apiClient.patch<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}draft/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getDraft: async (id: number): Promise<Product> => {
    try {
      const response = await apiClient.get<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}draft/${id}/`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  publishDraft: async (id: number): Promise<Product> => {
    try {
      const response = await apiClient.post<Product>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}draft/${id}/publish/`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteDraft: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}draft/${id}/`
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post<{ url: string }>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}upload-image/`,
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

  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}delete-image/`,
        {
          data: { image_url: imageUrl }
        }
      );
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