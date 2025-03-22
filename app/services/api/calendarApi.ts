import apiClient from '../api-client';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'meeting' | 'reminder';
}

export const calendarApi = {
  getEvents: async (): Promise<CalendarEvent[]> => {
    const response = await apiClient.get('/api/calendar/events');
    return response.data;
  },

  createEvent: async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const response = await apiClient.post('/api/calendar/events', event);
    return response.data;
  },

  updateEvent: async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const response = await apiClient.put(`/api/calendar/events/${id}`, event);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/calendar/events/${id}`);
  },
};