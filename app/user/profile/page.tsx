"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileApi } from '@/services/api/profileApi'; // Corrected import path
import { User } from '@/types/common'; // Corrected import path
import  Profile  from '@/components/Profile/Profile';
import React from 'react';
import { useToast } from "@/hooks/use-toast"

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast()

    useEffect(() => {
        loadUserProfile();
    }, []);

    async function loadUserProfile() {
        setLoading(true);
        setError(null);
        try {
            const profileData = await profileApi.getUserProfile()
            setUser(profileData);
        } catch (err:any) {
            setError(err.message);
            router.push('/auth/signin');
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error,
            })
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="profile-page-container">
            {user && React.createElement(Profile, { user: user, onUpdate: loadUserProfile })}
        </div>
    );
}