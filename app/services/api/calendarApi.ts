import apiClient from '../api-client';
import type { CalendarEvent } from '../../types/calendar';
import { AxiosResponse } from 'axios';

export const calendarApi = {
    getEvents: async (): Promise<CalendarEvent[]> => {
        try {
            const response = await apiClient.get<CalendarEvent[]>('/api/calendar/events/');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching calendar events:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch calendar events');
        }
    }
};