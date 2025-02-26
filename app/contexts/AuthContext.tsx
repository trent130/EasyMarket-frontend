"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthTokens } from '@/types/api';
import { apiService } from '@/services/api/api';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // First effect - handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    if (!isHydrated) return;

    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userProfile = await apiService.user.getProfile();
          setUser(userProfile);
          setIsAuthenticated(true);
        } catch (error) {
          clearAuthData();
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [isHydrated]); // Add isHydrated as dependency

  const saveAuthData = (data: AuthTokens) => {
    if (data.token || data.access) {
      localStorage.setItem('token', data.token || data.access || '');
    }
    if (data.refreshToken || data.refresh) {
      localStorage.setItem('refreshToken', data.refreshToken || data.refresh || '');
    }
    if (data.user_id) {
      localStorage.setItem('user_id', String(data.user_id));
    }
    if (data.email) {
      localStorage.setItem('email', data.email);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      // Determine if identifier is email or username
      const credentials = {
        email: identifier.includes('@') ? identifier : undefined,
        username: !identifier.includes('@') ? identifier : undefined,
        password
      };

      const authData = await apiService.login(credentials);
      
      // Save auth data
      // localStorage.setItem('token', authData.token || authData.access);
      // if (authData.refreshToken || authData.refresh) {
      //   localStorage.setItem('refreshToken', authData.refreshToken || authData.refresh);
      // }

      // Set initial user data
      const initialUser = { id: authData.user_id, email: authData.email };
      setUser(initialUser);
      localStorage.setItem('user', JSON.stringify(initialUser));
      setIsAuthenticated(true);

      // Try to get full profile
      try {
        const profile = await apiService.user.getProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (profileError) {
        console.error('Failed to fetch profile:', profileError);
      }

      window.dispatchEvent(new Event("authChange"));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    
    try {
      const response = await apiService.refreshToken(refreshToken);
      if (response && response.access) {
        localStorage.setItem('token', response.access);
        
        // Validate the new token by fetching user profile
        const userProfile = await apiService.user.getProfile();
        setUser(userProfile);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      return false;
    }
  };

  const logout = () => {
    clearAuthData();
    window.location.href = '/auth/signin';
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    refreshSession
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};