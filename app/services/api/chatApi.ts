import apiClient from '../api-client';
import { Conversation, Message, User } from '../../types/common';
import { AxiosResponse } from 'axios';

interface ChatParams {
    page?: number;
    pageSize?: number;
    before?: string;
    after?: string;
}

export const chatApi = {
    getConversations: (params?: Record<string, string | number>): Promise<Conversation[]> =>
        apiClient.get<Conversation[]>('/api/chat/conversations', { params }).then(response => response.data),

    getMessages: (conversationId: number, params?: Record<string, string | number>): Promise<Message[]> =>
        apiClient.get<Message[]>(`/api/chat/conversations/${conversationId}/messages`, { params }).then(response => response.data),

    sendMessage: (conversationId: number, content: string, attachments?: File[]): Promise<Message> => {
        const formData = new FormData();
        formData.append('content', content);
        attachments?.forEach(file => formData.append('attachments', file));

        return apiClient.post<Message>(`/api/chat/conversations/${conversationId}/messages`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Set content type to multipart/form-data
            }
        }).then(response => response.data);
    },

    markAsRead: (conversationId: number): Promise<void> =>
        apiClient.put<void>(`/api/chat/conversations/${conversationId}/read`).then(() => {}),
};

export type ChatApi = typeof chatApi;

// backend implimentations of the same needed
