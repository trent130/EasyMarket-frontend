import apiClient from '../api-client';
import { Product } from '../../types/product';
import { ApiError, WishlistItem } from '../../types/api';
import { Category, Review, CartItem, Order } from '../../types/marketplace';
import { API_CONFIG } from './config';
import { productCache, categoryCache, cartCache, wishlistCache, generateCacheKey } from './cache';

// Error handler
const handleApiError = (error: { response?: { data?: { message?: string }; status?: number } }): never => {
  const apiError: ApiError = {
    message: error.response?.data?.message || 'An error occurred',
    status: error.response?.status || 500
  };

  if(isApiError(error)) {
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

export const marketplaceApi = {
  // Categories
  getCategories: async (params?: {
    parent_id?: number;
    include_children?: boolean;
  }): Promise<Category[]> => {
    const cacheKey = generateCacheKey('categories', params);
    const cachedData = categoryCache.get<Category[]>(cacheKey);
    if (cachedData) return cachedData;

    const response = await apiClient.get<Category[]>(API_CONFIG.ENDPOINTS.MARKETPLACE.CATEGORIES, { params });
    categoryCache.set(cacheKey, response.data);
    return response.data;
  },

  // Products
  getProducts: async (params?: {
    category?: string;
    min_price?: number;
    max_price?: number;
    condition?: string;
    in_stock?: boolean;
    sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
    page?: number;
    limit?: number;
  }): Promise<{
    results: Product[];
    total: number;
    page: number;
    total_pages: number;
  }> => {
    const cacheKey = generateCacheKey('products', params);
    const cachedData = productCache.get<{
      results: Product[];
      total: number;
      page: number;
      total_pages: number;
    }>(cacheKey);
    if (cachedData) return cachedData;

    const response = await apiClient.get<{
      results: Product[];
      total: number;
      page: number;
      total_pages: number;
    }>(API_CONFIG.ENDPOINTS.PRODUCTS.LIST, { params });
    
    productCache.set(cacheKey, response.data);
    return response.data;
  },

  getCategoryDetails: async (slug: string): Promise<Category & {
    subcategories: Category[];
    featured_products: Product[];
  }> => {
    const cacheKey = generateCacheKey(`category:${slug}`);
    const cachedData = categoryCache.get<Category & { subcategories: Category[]; featured_products: Product[] }>(cacheKey);
    if (cachedData) return cachedData;

    const response = await apiClient.get<Category & {
      subcategories: Category[];
      featured_products: Product[];
    }>(API_CONFIG.ENDPOINTS.MARKETPLACE.CATEGORY_DETAILS(slug));
    categoryCache.set(cacheKey, response.data);
    return response.data;
  },

  // Wishlist
  getWishlist: async (): Promise<WishlistItem[]> => {
    try {
      const cacheKey = 'wishlist';
      const cachedData = wishlistCache.get<WishlistItem[]>(cacheKey);
      if (cachedData) return cachedData;

      const response = await apiClient.get<WishlistItem[]>(API_CONFIG.ENDPOINTS.MARKETPLACE.WISHLIST);
      wishlistCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (isApiError(error)) {
        throw handleApiError(error);
      } else {
        throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 } });
      }
    }
  },

  addToWishlist: async (productId: number): Promise<WishlistItem> => {
    try {
      const response = await apiClient.post<WishlistItem>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.WISHLIST}${productId}/add/`, { product_id: productId });
      wishlistCache.delete('wishlist'); // Invalidate wishlist cache
      return response.data;
    } catch (error) {
      if (isApiError(error)) {
        throw handleApiError(error);
      } else {
        throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 } });
      }
    }
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    try {
      await apiClient.post<void>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.WISHLIST}${productId}/remove/`, { product_id: productId });
      wishlistCache.delete('wishlist'); // Invalidate wishlist cache
    } catch (error) {
      if (isApiError(error)) {
        throw handleApiError(error);
      } else {
        throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 } });
      }
    }
  },

  // Cart
  getCart: async (): Promise<{
    items: CartItem[];
    total_items: number;
    total_amount: number;
  }> => {
    try {
      const cacheKey = 'cart';
      const cachedData = cartCache.get<{ items: CartItem[]; total_items: number; total_amount: number }>(cacheKey);
      if (cachedData) return cachedData;

      const response = await apiClient.get<{
        items: CartItem[];
        total_items: number;
        total_amount: number;
      }>(API_CONFIG.ENDPOINTS.MARKETPLACE.CART);
      cartCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (isApiError(error)) {
        throw handleApiError(error);
      } else {
        throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 } });
      }
    }
  },

  addToCart: async (productId: number, quantity: number = 1): Promise<CartItem> => {
    try {
      const response = await apiClient.post<CartItem>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.CART}add/`, {
        product_id: productId,
        quantity
      });
      cartCache.delete('cart'); // Invalidate cart cache
      return response.data;
    } catch (error) {
      if (isApiError(error)) {
        throw handleApiError(error);
      } else {
        throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 } });
      }
    }
  },

  removeFromCart: async (itemId: number): Promise<void> => {
    try {
      await apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.CART}items/${itemId}/`);
      cartCache.delete('cart'); // Invalidate cart cache
    } catch (error) {
      if (isApiError(error)) {
        throw handleApiError(error);
      } else {
        throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 } });
      }
    }
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<CartItem> => {
    const response = await apiClient.patch<CartItem>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.CART}items/${itemId}/`, {
      quantity
    });
    cartCache.delete('cart'); // Invalidate cart cache
    return response.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.post<void>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.CART}clear/`);
    cartCache.delete('cart'); // Invalidate cart cache
  },

  // Reviews
  getProductReviews: async (productId: number, params?: {
    rating?: number;
    sort_by?: 'latest' | 'rating';
    page?: number;
  }): Promise<{
    results: Review[];
    total: number;
    average_rating: number;
    rating_distribution: Record<number, number>;
  }> => {
    const response = await apiClient.get<{
      results: Review[];
      total: number;
      average_rating: number;
      rating_distribution: Record<number, number>;
    }>(API_CONFIG.ENDPOINTS.PRODUCTS.REVIEWS(productId), { params });
    return response.data;
  },

  addReview: async (productId: number, data: {
    rating: number;
    comment: string;
  }): Promise<Review> => {
    const response = await apiClient.post<Review>(API_CONFIG.ENDPOINTS.PRODUCTS.REVIEWS(productId), data);
    return response.data;
  },

  updateReview: async (reviewId: number, data: {
    rating?: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await apiClient.patch<Review>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.REVIEWS}/${reviewId}/`, data);
    return response.data;
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.REVIEWS}/${reviewId}/`);
  },

  // Search
  search: async (params: {
    query: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
    page?: number;
  }): Promise<{
    results: Product[];
    total: number;
    page: number;
    categories: Category[];
    price_range: { min: number; max: number };
  }> => {
    const response = await apiClient.get<{
      results: Product[];
      total: number;
      page: number;
      categories: Category[];
      price_range: { min: number; max: number };
    }>(API_CONFIG.ENDPOINTS.MARKETPLACE.SEARCH, { params });
    return response.data;
  },

  // Recommendations
  getRecommendations: async (params?: {
    category?: string;
    limit?: number;
    exclude_ids?: number[];
  }): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(API_CONFIG.ENDPOINTS.MARKETPLACE.RECOMMENDATIONS, { params });
    return response.data;
  },

  // Orders
  getOrders: async (params?: {
    status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    page?: number;
    limit?: number;
  }): Promise<{
    results: Order[];
    total: number;
    page: number;
  }> => {
    const response = await apiClient.get<{
      results: Order[];
      total: number;
      page: number;
    }>(API_CONFIG.ENDPOINTS.MARKETPLACE.ORDERS, { params });
    return response.data;
  },

  // Messaging
  sendMessage: async (productId: number, message: string): Promise<void> => {
    try {
      await apiClient.post<void>(API_CONFIG.ENDPOINTS.MARKETPLACE.MESSAGES, {
        product_id: productId,
        message
      });
    } catch (error) {
      if (isApiError(error)) {
        throw handleApiError(error);
      } else {
        throw handleApiError({ response: { data: { message: 'Unexpected error occurred' }, status: 500 } });
      }
    }
  }
};