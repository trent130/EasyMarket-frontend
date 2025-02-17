import apiClient from '../api-client';
import { AxiosResponse } from 'axios';

interface AnalyticsData {
    views: number;
    uniqueVisitors: number;
    averageTime: number;
    bounceRate: number;
    topProducts: Array<{
        productId: number;
        name: string;
        views: number;
        conversions: number;
    }>;
    salesTrends: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
}

interface AnalyticsParams {
    startDate: string;
    endDate: string;
    granularity?: 'day' | 'week' | 'month';
}

export const analyticsApi = {
    getDashboardMetrics: (params: Record<string, string | number>): Promise<AnalyticsData> =>
        apiClient.get<AnalyticsData>('/api/analytics/dashboard', { params }).then(response => response.data),

    getProductMetrics: (productId: number, params: Record<string, string | number>): Promise<AnalyticsData> =>
        apiClient.get<AnalyticsData>(`/api/analytics/products/${productId}`, { params }).then(response => response.data),

    getUserBehavior: (params: Record<string, string | number>): Promise<AnalyticsData> =>
        apiClient.get<AnalyticsData>('/api/analytics/user-behavior', { params }).then(response => response.data),

    exportReport: (params: Record<string, string | number>): Promise<Blob> =>
        apiClient.get('/api/analytics/export', {
            params,
            responseType: 'blob' // Important for binary data!
        }).then(response => response.data),
};

export type AnalyticsApi = typeof analyticsApi;