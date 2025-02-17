// app/auth/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface SecurityQuestion {
    question: string;
    answer: string;
}

interface Session {
  id: string;
  userAgent: string;
  ip: string;
  lastActive: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// This server action will call your Django backend to check if the user has set up
// their security questions
export async function checkSecurityQuestions(): Promise<{ hasSecurityQuestions: boolean; } | { error: string; }> {
    try {
        const token = cookies().get('authToken')?.value;
        if (!token) {
            return { error: 'Unauthorized' };
        }

        const response = await fetch(`${API_URL}/api/auth/security-questions/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        return { error: error.message || 'Failed to check security questions.' };
    }
}

// This server action will call your Django backend to submit
// the security questions.
export async function submitSecurityQuestions(securityQuestions: SecurityQuestion[]): Promise<{ message: string; } | { error: string; }> {
    try {
        const token = cookies().get('authToken')?.value;
        if (!token) {
            return { error: 'Unauthorized' };
        }

        const response = await fetch(`${API_URL}/api/auth/security-questions/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ securityQuestions }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        revalidatePath('/auth/security-questions');
        return data;
    } catch (error: any) {
        return { error: error.message || 'Failed to set security questions.' };
    }
}

// Fetch Sessions
export async function fetchSessions(): Promise<Session[] | { error: string }> {
    try {
        const token = cookies().get('authToken')?.value;
        if (!token) {
            return { error: 'Unauthorized' };
        }

        const response = await fetch(`${API_URL}/api/auth/sessions/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        return { error: error.message || 'Failed to fetch sessions.' };
    }
}

// Terminate Session
export async function terminateSession(sessionId: string): Promise<{ message: string } | { error: string }> {
    try {
        const token = cookies().get('authToken')?.value;
        if (!token) {
            return { error: 'Unauthorized' };
        }

        const response = await fetch(`${API_URL}/api/auth/sessions/${sessionId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        revalidatePath('/auth/sessions');
        return { message: 'Session terminated successfully.' };
    } catch (error: any) {
        return { error: error.message || 'Failed to terminate session.' };
    }
}