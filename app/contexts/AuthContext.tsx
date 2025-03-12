"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api/api';
import { User } from '@/types/api';
import { STORAGE_KEYS, setAuthToken, clearAuthData } from '@/services/api-client';

/**
 * Authentication Context Type Definition
 * Defines the shape of the authentication context
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  register: (userData: any) => Promise<any>;
  refreshUserData: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth-related functionality
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (token) {
          // Set the token in the API client
          setAuthToken(token);
          
          // Try to get user data to validate the token
          try {
            const userData = await apiService.user.getProfile();
            setUser(userData);
            setIsAuthenticated(true);
            
            // Broadcast auth state change
            window.dispatchEvent(new Event('authChange'));
          } catch (profileError) {
            console.error('Failed to fetch profile, checking token validity:', profileError);
            
            // If we can't get the profile, check if the token is still valid
            try {
              const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
                console.log('Using stored user data:', parsedUser);
              } else {
                // If no stored user, try to verify token
                const isValid = await apiService.auth.verifyToken(token);
                if (isValid.valid) {
                  setIsAuthenticated(true);
                  console.log('Token is valid, but no user data available');
                } else {
                  throw new Error('Invalid token');
                }
              }
            } catch (tokenError) {
              console.error('Token validation failed:', tokenError);
              clearAuthData();
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        // Clear invalid auth data
        clearAuthData();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, []);

  // Listen for storage events (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TOKEN) {
        if (!e.newValue) {
          // Token was removed
          setIsAuthenticated(false);
          setUser(null);
        } else if (e.newValue !== e.oldValue) {
          // Token was changed, refresh user data
          refreshUserData();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try different credential formats to match what the backend expects
      let response;
      
      // Format 1: email/username and password
      const credentials1 = {
        email: email.includes('@') ? email : undefined,
        username: !email.includes('@') ? email : undefined,
        password
      };
      
      // Format 2: username as email and password
      const credentials2 = {
        username: email,
        password
      };
      
      // Format 3: email as username and password
      const credentials3 = {
        email: email,
        password
      };
      
      // Try the first format
      try {
        console.log('Trying login with format 1:', { ...credentials1, password: '********' });
        response = await apiService.auth.login(credentials1);
      } catch (err1) {
        console.log('Format 1 failed, trying format 2');
        
        // Try the second format
        try {
          console.log('Trying login with format 2:', { ...credentials2, password: '********' });
          response = await apiService.auth.login(credentials2);
        } catch (err2) {
          console.log('Format 2 failed, trying format 3');
          
          // Try the third format
          console.log('Trying login with format 3:', { ...credentials3, password: '********' });
          response = await apiService.auth.login(credentials3);
        }
      }
      
      if (response.token || response.access) {
        // Get user data
        try {
          const userData = await apiService.user.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
          
          // Store user data
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
          
          // Broadcast auth state change
          window.dispatchEvent(new Event('authChange'));
          
          return response;
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          // Continue with basic authentication even if profile fetch fails
          setIsAuthenticated(true);
        }
      }
      
      return response;
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      // Call logout API if available
      await apiService.auth.logout();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Clear auth data regardless of API success
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      // Broadcast auth state change
      window.dispatchEvent(new Event('authChange'));
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.auth.register(userData);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const userData = await apiService.user.getProfile();
      setUser(userData);
    } catch (err: any) {
      console.error('Failed to refresh user data:', err);
      if (err.status === 401) {
        // Token is invalid, clear auth data
        clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      const updatedUser = await apiService.user.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    refreshUserData,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the auth context
 * Ensures the hook is used within an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};