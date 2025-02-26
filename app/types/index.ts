export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
  is_active: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface BaseSearchParams {
  query?: string;
  category?: number;
  min_price?: number;
  max_price?: number;
  condition?: string;
  in_stock?: boolean;
}

export interface SearchParams extends BaseSearchParams {
  sort_by?: SortOption;
}

export interface FilterParams extends BaseSearchParams, PaginationParams {
  sort_by?: SortOption;
}

export * from './product';
