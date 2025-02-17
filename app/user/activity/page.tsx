"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast"
import { securityApi } from '@/services/api/security';

interface SecurityLog {
    id: string;
    userId: number;
    action: string;
    ipAddress: string;
    userAgent: string;
    location: string;
    timestamp: string;
    status: 'success' | 'failure';
    details?: Record<string, unknown>;
}


export default function UserActivity() {
    const [activityLogs, setActivityLogs] = useState<SecurityLog[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast()

    useEffect(() => {
        const fetchActivityLogs = async () => {
            setIsLoading(true);
            setError('');
            try {
                const logs = await securityApi.getActivityLogs();
                setActivityLogs(logs);
            } catch (e: any) {
                setError(e.message || 'Failed to fetch activity logs');
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: error,
                })
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivityLogs();
    }, [router, toast]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 p-4">
            <h1 className="text-2xl font-bold mb-4">Your Account Activity</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <ul className="space-y-4">
                {activityLogs.map((log, index) => (
                    <li key={log.id} className="border p-4 rounded-lg">
                        <p><strong>Action:</strong> {log.action}</p>
                        <p><strong>Details:</strong> {log.details}</p>
                        <p><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
            {activityLogs.length === 0 && <p>No activity logs found.</p>}
        </div>
    );
}