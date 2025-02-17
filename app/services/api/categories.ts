import apiClient from '../api-client';
import type { ApiResponse }  from '../../types/common';
import { AxiosResponse } from 'axios';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
  is_active: boolean;
}

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<ApiResponse<Category>>('/categories/');
  return response.data.results || [];
};

export const fetchCategoryBySlug = async (slug: string): Promise<Category> => {
  const response = await apiClient.get<Category>(`/categories/${slug}/`);
  return response.data;
};

// Category Products
export const fetchCategoryProducts = async (slug: string): Promise<Category[]> => {
  const response = await apiClient.get<ApiResponse<Category>>(`/categories/${slug}/products/`);
  return response.data.results || [];
};

// Featured Categories
export const fetchFeaturedCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<ApiResponse<Category>>('/categories/featured/');
  return response.data.results || [];
};

// Category Statistics
export interface CategoryStats {
  total_products: number;
  active_products: number;
  total_sales: number;
  average_price: number;
}

export const fetchCategoryStats = async (categoryId: number): Promise<CategoryStats> => {
  const response = await apiClient.get<CategoryStats>(`/categories/${categoryId}/stats/`);
  return response.data;
};