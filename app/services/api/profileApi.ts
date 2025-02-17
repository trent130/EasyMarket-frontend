import apiClient from '../api-client';
import { User } from '../../types/common';
import {
    PublicKeyCredentialCreationOptions,
    PublicKeyCredentialRequestOptions,
} from '@simplewebauthn/typescript-types';
import { AxiosResponse } from 'axios';

export interface SecurityKey {
    id: string;
    name: string;
    lastUsed: string;
    credentialId: string;
}

export interface WebAuthnError extends Error {
    name: 'NotAllowedError' | 'SecurityError' | 'AbortError';
}

interface ProfileUpdateData {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: File;
}

export const profileApi = {
    updateProfile: (formData: FormData): Promise<User> =>
        apiClient.put<User>('/api/user/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Let browser set content-type for FormData
            }
        }).then(response => response.data),

    getWebAuthnRegistrationOptions: (): Promise<PublicKeyCredentialCreationOptions> =>
        apiClient.get<PublicKeyCredentialCreationOptions>('/api/auth/webauthn/register-options').then(response => response.data),

    verifyWebAuthnRegistration: (credential: any, keyName: string): Promise<any> => // Replace 'any' with appropriate type if available
        apiClient.post('/api/auth/webauthn/verify-registration', { credential, keyName }).then(response => response.data),

    getWebAuthnAuthOptions: (): Promise<PublicKeyCredentialRequestOptions> =>
        apiClient.get<PublicKeyCredentialRequestOptions>('/api/auth/webauthn/auth-options').then(response => response.data),

    verifyWebAuthnAuthentication: (credential: any): Promise<any> => // Replace 'any' with appropriate type if available
        apiClient.post('/api/auth/webauthn/verify-authentication', credential).then(response => response.data),

    getSecurityKeys: (): Promise<SecurityKey[]> =>
        apiClient.get<SecurityKey[]>('/api/user/security-keys').then(response => response.data),

    removeSecurityKey: (keyId: string): Promise<any> => // Replace 'any' with appropriate type if available
        apiClient.delete(`/api/user/security-keys/${keyId}`).then(response => response.data),

    exportUserData: (): Promise<Blob> =>
        apiClient.get('/api/user/data-export', {
            responseType: 'blob',
            headers: {
                'Accept': 'application/json' //Added accept type
            }
        }).then(response => response.data),

    deleteAccount: (): Promise<any> => // Replace 'any' with appropriate type if available
        apiClient.post('/api/user/delete-account').then(response => response.data),
};

// impimentations in the backend 
