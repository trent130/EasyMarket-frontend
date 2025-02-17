import apiClient from '../api-client';
import { AxiosResponse } from 'axios';

interface Notification {
    id: number;
    userId: number;
    type: 'order' | 'payment' | 'system' | 'message';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

interface NotificationQueryParams {
    page?: number;
    pageSize?: number;
    type?: Notification['type'];
    read?: boolean;
}

export const notificationsApi = {
    getNotifications: (params?: Record<string, string | number>): Promise<Notification[]> =>
        apiClient.get<Notification[]>('/api/notifications', { params }).then(response => response.data),

    markAsRead: (id: number): Promise<void> =>
        apiClient.put<void>(`/api/notifications/${id}/read`).then(() => {}),

    markAllAsRead: (): Promise<void> =>
        apiClient.put<void>('/api/notifications/mark-all-read').then(() => {}),

    deleteNotification: (id: number): Promise<void> =>
        apiClient.delete<void>(`/api/notifications/${id}`).then(() => {})
};

export type NotificationsApi = typeof notificationsApi;