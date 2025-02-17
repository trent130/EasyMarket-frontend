import apiClient from '../../lib/api-client';
import type { Category, Product, ProductBase } from '../../types/product';
import type { ApiResponse, SingleResponse, SearchParams } from '../../types/common';
import { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/products/api';

// Products
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product>>('/products/');
  return response.data.results || [];
};

/**
 * Fetch a product by its ID
 * @param {number} id The product ID.
 * @returns {Promise<Product>} The product.
 */
export const fetchProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<SingleResponse<Product>>(`/products/${id}/`);
  return response.data.data;
};

/**
 * Fetch a product by its slug.
 * @param {string} slug The product slug.
 * @returns {Promise<Product>} The product object.
 */
export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  const response = await apiClient.get<SingleResponse<Product>>(`/products/${slug}/`);
  return response.data.data;
};

// Search
export const searchProducts = async (params: SearchParams): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product>>('/products/search/', { params });
  return response.data.results || [];
};

// Featured Products
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product>>('/products/featured/');
  return response.data.results || [];
};

// Trending Products
export const fetchTrendingProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product>>('/products/trending/');
  return response.data.results || [];
};

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/categories/');
  return response.data;
};

// Create Product
export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  const response = await apiClient.post<SingleResponse<Product>>('/products/', data);
  return response.data.data;
};

// Update Product
export const updateProduct = async (id: number, data: Partial<Product>): Promise<Product> => {
  const response = await apiClient.put<SingleResponse<Product>>(`/products/${id}/`, data);
  return response.data.data;
};

// Delete Product
export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}/`);
};

// Get Product Details
export const getProductDetails = async (slug: string): Promise<Product> => {
  try {
    const response = await apiClient.get<Product>(`/products/${slug}/`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Product not found');
    }
    throw error;
  }
};

export default apiClient;