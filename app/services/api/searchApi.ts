import { SearchParams, SearchResults } from '@/types/common';
import apiClient from '../api-client';


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
