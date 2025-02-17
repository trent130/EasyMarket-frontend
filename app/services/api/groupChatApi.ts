import { fetchWrapper } from '../../utils/fetchWrapper';
import { GroupChat, GroupMessage } from '../../types/common';
import { WebSocketService, WebSocketMessageType } from '../../../lib/websocket';



// interface GroupChatParams {
import apiClient from '../api-client';
import { GroupChat, GroupMessage } from '../../types/common';
import { WebSocketService, WebSocketMessageType } from '../../../lib/websocket';
import { AxiosResponse } from 'axios';

export const groupChatApi = {
    // Group Management
    createGroup: (data: { name: string; description?: string; memberIds: number[] }): Promise<GroupChat> =>
        apiClient.post<GroupChat>('/api/chat/groups', data).then(response => response.data),

    updateGroup: (groupId: number, data: Partial<GroupChat>): Promise<GroupChat> =>
        apiClient.put<GroupChat>(`/api/chat/groups/${groupId}`, data).then(response => response.data),

    // Member Management
    addMembers: (groupId: number, memberIds: number[]): Promise<GroupChat> =>
        apiClient.post<GroupChat>(`/api/chat/groups/${groupId}/members`, { memberIds }).then(response => response.data),

    removeMembers: (groupId: number, memberIds: number[]): Promise<GroupChat> =>
        apiClient.delete<GroupChat>(`/api/chat/groups/${groupId}/members`, { data: { memberIds } }).then(response => response.data),

    // Message Management
    getGroupMessages: (groupId: number, params?: Record<string, string | number>): Promise<GroupMessage[]> =>
        apiClient.get<GroupMessage[]>(`/api/chat/groups/${groupId}/messages`, { params }).then(response => response.data),

    sendGroupMessage: (groupId: number, content: string, attachments?: File[]): Promise<GroupMessage> => {
        const formData = new FormData();
        formData.append('content', content);
        attachments?.forEach(file => formData.append('attachments', file));

        return apiClient.post<GroupMessage>(`/api/chat/groups/${groupId}/messages`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(response => response.data);
    },

    // Reactions
    addReaction: (groupId: number, messageId: number, emoji: string): Promise<GroupMessage> =>
        apiClient.post<GroupMessage>(`/api/chat/groups/${groupId}/messages/${messageId}/reactions`, { emoji }).then(response => response.data),

    removeReaction: (groupId: number, messageId: number, emoji: string): Promise<GroupMessage> =>
        apiClient.delete<GroupMessage>(`/api/chat/groups/${groupId}/messages/${messageId}/reactions`, { data: { emoji } }).then(response => response.data),

    // Real-time features using WebSocket
    subscribeToGroupUpdates: (groupId: number, wsService: WebSocketService) => {
        wsService.subscribe(WebSocketMessageType.CHAT_MESSAGE, (message: unknown) => {
            const groupMessage = message as GroupMessage;
            if (groupMessage.groupId === groupId) {
                // Handle new message
                console.log('New group message:', groupMessage);
            }
        });
    }
};

export type GroupChatApi = typeof groupChatApi;

// implimentation of the backend generally needed here for the urls and so in the marketplace app
