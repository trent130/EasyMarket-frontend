import apiClient from '@/services/api-client';
import type { Review, ReviewQueryParams, User } from '../../types/common';
import { AxiosResponse } from 'axios';

// Reviews
export const fetchReviews = async (params?: ReviewQueryParams): Promise<Review[]> => {
  const response = await apiClient.get<Review[]>('/products/reviews/', { params });
  return response.data;
};

// Create Review
export const createReview = async (data: Partial<Review>): Promise<Review> => {
  const response = await apiClient.post<Review>('/products/reviews/', data);
  return response.data;
};

// Update Review
export const updateReview = async (id: number, data: Partial<Review>): Promise<Review> => {
  const response = await apiClient.put<Review>(`/products/reviews/${id}`, data);
  return response.data;
};

// Delete Review
export const deleteReview = async (id: number): Promise<void> => {
  await apiClient.delete<void>(`/products/reviews/${id}`);
};

export default apiClient;