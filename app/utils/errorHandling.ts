import axios from 'axios';
import { ApiError } from '@/types/api';

export class ApplicationError extends Error {
    constructor(
        message: string,
        public code: string,
        public status: number = 500,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class ValidationError extends ApplicationError {
    constructor(message: string, public errors: Record<string, string[]>) {
        super(message, 'VALIDATION_ERROR', 400, { errors });
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends ApplicationError {
    constructor(message: string = 'Authentication required') {
        super(message, 'AUTHENTICATION_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends ApplicationError {
    constructor(message: string = 'Permission denied') {
        super(message, 'AUTHORIZATION_ERROR', 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends ApplicationError {
    constructor(message: string = 'Resource not found') {
        super(message, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

export function handleApiError(error: unknown): never {
    if (error instanceof ApplicationError) {
        throw error;
    }

    if (isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        const details = error.response?.data;

        switch (status) {
            case 400:
                if (details?.errors) {
                    throw new ValidationError(message, details.errors);
                }
                throw new ApplicationError(message, 'BAD_REQUEST', status, details);
            case 401:
                throw new AuthenticationError(message);
            case 403:
                throw new AuthorizationError(message);
            case 404:
                throw new NotFoundError(message);
            default:
                throw new ApplicationError(
                    message,
                    'API_ERROR',
                    status,
                    details
                );
        }
    }

    if (error instanceof Error) {
        throw new ApplicationError(
            error.message,
            'UNKNOWN_ERROR',
            500,
            { originalError: error }
        );
    }

    throw new ApplicationError(
        'An unknown error occurred',
        'UNKNOWN_ERROR',
        500,
        { originalError: error }
    );
}

function isAxiosError(error: unknown): error is {
    response?: {
        status?: number;
        data?: {
            message?: string;
            errors?: Record<string, string[]>;
            [key: string]: any;
        };
    };
    message: string;
} {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        ('response' in error || 'request' in error)
    );
}

// Utility function for logging errors
export function logError(error: unknown, context?: string) {
    const errorMessage = handleApiError(error);
    console.error(`${context ? `[${context}] ` : ''}${errorMessage}`, error);
}

// Custom error handler for React components
export function createErrorHandler(context?: string) {
    return (error: unknown) => {
        const errorMessage = handleApiError(error);
        // You can add additional error reporting logic here
        // For example, sending error to a monitoring service
        logError(error, context);
        return errorMessage;
    };
}