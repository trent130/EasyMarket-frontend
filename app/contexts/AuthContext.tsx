"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '@/services/api/api';
import { STORAGE_KEYS } from '@/services/api-client';
import { User } from '@/types/api';

/**
 * Authentication Context Type Definition
 * Defines the shape of the authentication context
 */
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  login: async () => {},
  logout: () => {}
});

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth-related functionality
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  /**
   * Initialize authentication state from localStorage
   * This runs once when the component mounts
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Set initial state from localStorage
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } catch (e) {
            console.error('Failed to parse stored user data:', e);
          }
        }

        // Validate token with API
        try {
          const profile = await apiService.user.getProfile();
          setUser(profile);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid auth data
          handleLogout();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user logout
   * Clears auth data and redirects to login page
   */
  const handleLogout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
    
    // Use window.location for full page refresh to ensure clean state
    window.location.href = '/auth/signin';
  };

  /**
   * Handle user login
   * Authenticates user and stores auth data
   */
  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      // Determine if identifier is email or username
      const credentials = {
        email: identifier.includes('@') ? identifier : undefined,
        username: !identifier.includes('@') ? identifier : undefined,
        password
      };

      // Authenticate with API
      const authData = await apiService.login(credentials);
      
      // Set initial user state
      const initialUser = { 
        id: authData.user_id, 
        email: authData.email 
      };
      
      setUser(initialUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(initialUser));
      setIsAuthenticated(true);

      // Get complete profile
      try {
        const profile = await apiService.user.getProfile();
        setUser(profile);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      } catch (profileError) {
        console.error('Profile fetch failed:', profileError);
        // Continue with basic user info if profile fetch fails
      }

      // Use window.location for full page refresh to ensure clean state
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
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