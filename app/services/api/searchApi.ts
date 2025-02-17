import apiClient from '../api-client';
import { Product } from '../../types/product';
import { PaginatedResponse } from '../../types/common';
import { MarketplaceListing } from '../../types/marketplace';
import { AxiosResponse } from 'axios';

interface SearchResults {
    products: PaginatedResponse<Product>;
    listings: PaginatedResponse<MarketplaceListing>;
    categories: string[];
    suggestions: string[];
}

interface SearchParams {
    query: string;
    filters?: {
        category?: string[];
        priceRange?: [number, number];
        rating?: number;
        availability?: boolean;
    };
    sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
    page?: number;
    pageSize?: number;
}

export const searchApi = {
    search: (params: SearchParams): Promise<SearchResults> =>
        apiClient.get<SearchResults>('/marketplace/api/search', {
            params: Object.fromEntries(
                Object.entries(params).map(([key, value]) => [
                    key,
                    typeof value === 'object' ? JSON.stringify(value) : value
                ])
            )
        }).then(response => response.data),

    getAutoComplete: (query: string): Promise<string[]> =>
        apiClient.get<string[]>('/marketplace/api/search/autocomplete', {
            params: { query }
        }).then(response => response.data),

    getPopularSearches: (): Promise<string[]> =>
        apiClient.get<string[]>('/marketplace/api/search/popular').then(response => response.data),
};

export type SearchApi = typeof searchApi;
