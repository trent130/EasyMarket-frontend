import apiClient from '../api-client';
import { API_CONFIG } from './config';
import { ApiError } from '@/types/api';

interface Message {
  id: number;
  sender: {
    id: number;
    username: string;
    avatar?: string;
  };
  recipient: {
    id: number;
    username: string;
    avatar?: string;
  };
  content: string;
  created_at: string;
  read: boolean;
  product?: {
    id: number;
    title: string;
    price: number;
    image?: string;
  };
}

interface Conversation {
  id: number;
  other_user: {
    id: number;
    username: string;
    avatar?: string;
  };
  last_message: Message;
  unread_count: number;
  product?: {
    id: number;
    title: string;
    price: number;
    image?: string;
  };
}

export const messagesApi = {
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await apiClient.get<Conversation[]>(API_CONFIG.ENDPOINTS.MARKETPLACE.MESSAGES);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getMessages: async (conversationId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    results: Message[];
    total: number;
    page: number;
  }> => {
    try {
      const response = await apiClient.get<{
        results: Message[];
        total: number;
        page: number;
      }>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.MESSAGES}${conversationId}/messages/`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  sendMessage: async (conversationId: number, content: string): Promise<Message> => {
    try {
      const response = await apiClient.post<Message>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.MESSAGES}${conversationId}/messages/`, {
        content
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  markAsRead: async (conversationId: number): Promise<void> => {
    try {
      await apiClient.post<void>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.MESSAGES}${conversationId}/read/`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteMessage: async (conversationId: number, messageId: number): Promise<void> => {
    try {
      await apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.MESSAGES}${conversationId}/messages/${messageId}/`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteConversation: async (conversationId: number): Promise<void> => {
    try {
      await apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.MARKETPLACE.MESSAGES}${conversationId}/`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

const handleApiError = (error: unknown): never => {
  const apiError: ApiError = {
    message: 'An error occurred',
    status: 500
  };

  if (isApiError(error)) {
    apiError.message = error.response?.data?.message || 'An error occurred';
    apiError.status = error.response?.status || 500;
  }

  throw apiError;
};

const isApiError = (error: unknown): error is { response?: { data?: { message?: string }; status?: number } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
}; 