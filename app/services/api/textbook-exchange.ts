import apiClient from '../api-client';
import { API_CONFIG } from './config';
import { ApiError } from '@/types/api';
import { Product } from '@/types/product';
import { handleApiError } from '@/utils/errorHandling';

interface TextbookData {
  isbn: string;
  title: string;
  author: string;
  edition?: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  price: number;
  description?: string;
  course_code?: string;
  images: string[];
}

interface TextbookSearchParams {
  isbn?: string;
  course_code?: string;
  title?: string;
  author?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

export const textbookExchangeApi = {
  searchTextbooks: async (params: TextbookSearchParams): Promise<{
    results: Product[];
    total: number;
    page: number;
  }> => {
    try {
      const response = await apiClient.get<{
        results: Product[];
        total: number;
        page: number;
      }>('/marketplace/textbooks/search/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getTextbookDetails: async (isbn: string): Promise<Product> => {
    try {
      const response = await apiClient.get<Product>(`/marketplace/textbooks/${isbn}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  listTextbook: async (data: TextbookData): Promise<Product> => {
    try {
      const response = await apiClient.post<Product>('/marketplace/textbooks/', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateTextbook: async (isbn: string, data: Partial<TextbookData>): Promise<Product> => {
    try {
      const response = await apiClient.patch<Product>(`/marketplace/textbooks/${isbn}/`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteTextbook: async (isbn: string): Promise<void> => {
    try {
      await apiClient.delete(`/marketplace/textbooks/${isbn}/`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  uploadTextbookImage: async (isbn: string, imageFile: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.post<{ url: string }>(
        `/marketplace/textbooks/${isbn}/images/`,
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

  deleteTextbookImage: async (isbn: string, imageUrl: string): Promise<void> => {
    try {
      await apiClient.delete(`/marketplace/textbooks/${isbn}/images/`, {
        data: { image_url: imageUrl }
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCourseCodes: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>('/marketplace/textbooks/course-codes/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  lookupISBN: async (isbn: string): Promise<{
    title: string;
    author: string;
    edition?: string;
    publisher?: string;
    published_date?: string;
  }> => {
    try {
      const response = await apiClient.get(`/marketplace/textbooks/lookup/${isbn}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}; 