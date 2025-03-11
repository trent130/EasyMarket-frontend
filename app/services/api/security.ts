import { SecurityLog, SecuritySettings } from '@/types/security';
import apiClient from '../api-client';
// import { AxiosResponse } from 'axios';



export const securityApi = {
    // Security Settings
    getSecuritySettings: (): Promise<SecuritySettings> =>
        apiClient.get<SecuritySettings>('/api/security/settings').then(response => response.data),

    updateSecuritySettings: (settings: Partial<SecuritySettings>): Promise<any> =>
        apiClient.put('/api/security/settings', settings).then(response => response.data),

    // Activity Logging
    getActivityLogs: (params?: {
        startDate?: string;
        endDate?: string;
        type?: string;
        page?: number;
        pageSize?: number;
    }): Promise<SecurityLog[]> =>
        apiClient.get<SecurityLog[]>('/api/security/activity-logs', { params }).then(response => response.data),

    // Password Management
    changePassword: (currentPassword: string, newPassword: string): Promise<any> =>
        apiClient.post('/api/security/change-password', { currentPassword, newPassword }).then(response => response.data),

    setupSecurityQuestions: (questions: Array<{ question: string; answer: string }>): Promise<any> =>
        apiClient.post('/api/security/security-questions', { questions }).then(response => response.data),

    // Device Management
    getTrustedDevices: (): Promise<Array<{
        id: string;
        name: string;
        lastUsed: string;
        browser: string;
        os: string;
        isCurrent: boolean;
    }>> =>
        apiClient.get<Array<{
            id: string;
            name: string;
            lastUsed: string;
            browser: string;
            os: string;
            isCurrent: boolean;
        }>>('/api/security/trusted-devices').then(response => response.data),

    removeTrustedDevice: (deviceId: string): Promise<any> =>
        apiClient.delete(`/api/security/trusted-devices/${deviceId}`).then(response => response.data),

    // Session Management
    getActiveSessions: (): Promise<Array<{
        id: string;
        ipAddress: string;
        location: string;
        device: string;
        lastActive: string;
        isCurrent: boolean;
    }>> =>
        apiClient.get<Array<{
            id: string;
            ipAddress: string;
            location: string;
            device: string;
            lastActive: string;
            isCurrent: boolean;
        }>>('/api/security/active-sessions').then(response => response.data),

    terminateSession: (sessionId: string): Promise<any> =>
        apiClient.delete(`/api/security/active-sessions/${sessionId}`).then(response => response.data),

    terminateAllOtherSessions: (): Promise<any> =>
        apiClient.post('/api/security/active-sessions/terminate-others').then(response => response.data),

    // Login Verification
    requestLoginVerification: (email: string): Promise<any> =>
        apiClient.post('/api/security/login-verification', { email }).then(response => response.data),

    verifyLoginCode: (email: string, code: string): Promise<any> =>
        apiClient.post('/api/security/verify-login-code', { email, code }).then(response => response.data)
};

export type SecurityApi = typeof securityApi;

// Note: The following URLs are not implemented in the backend, so this is a work in progress.