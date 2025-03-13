"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User } from '@/types/api';
import { apiService } from '@/services/api/api';

export default function UserProfile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!isAuthenticated && !loading) {
      router.push('/auth/signin');
      return;
    }

    // If authenticated, fetch profile data
    if (isAuthenticated && user) {
      const fetchProfileData = async () => {
        try {
          setIsLoading(true);
          const profile = await apiService.user.getProfile();
          setProfileData(profile);
        } catch (err: any) {
          console.error('Error fetching profile:', err);
          setError(err.message || 'Failed to load profile data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfileData();
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
    }

    if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayUser = profileData || user;

  if (!displayUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>No user data available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
        
        <div className="mb-6 text-center">
          {displayUser.profile_image ? (
            <img 
              src={displayUser.profile_image} 
              alt="Profile" 
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto bg-gray-300 flex items-center justify-center">
              <span className="text-4xl text-gray-600">
                {displayUser.name?.charAt(0) || displayUser.username?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <p className="border rounded p-2 w-full bg-gray-50">{displayUser.username || 'Not set'}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <p className="border rounded p-2 w-full bg-gray-50">{displayUser.name || 'Not set'}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <p className="border rounded p-2 w-full bg-gray-50">{displayUser.email}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">2FA Status</label>
            <p className="border rounded p-2 w-full bg-gray-50">
              {displayUser.is_2fa_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => router.push('/user/profile/edit')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => router.push('/user/security')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Security Settings
          </button>
        </div>
      </div>
        </div>
    );
}