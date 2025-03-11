import { useState } from 'react';
import { apiService } from '@/services/api/api';
import { TwoFactorAuthResponse, TwoFactorStatusResponse, TwoFactorVerifyResponse } from '@/types/api';

/**
 * Custom hook for managing 2FA functionality
 */
export const use2FA = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  /**
   * Get current 2FA status
   */
  const getStatus = async (): Promise<TwoFactorStatusResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get2FAStatus();
      setIs2FAEnabled(response.isEnabled);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to get 2FA status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enable 2FA for the current user
   */
  const enable2FA = async (): Promise<TwoFactorAuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.enable2FA();
      setQrCode(response.qrCodeUrl);
      setSecret(response.secret);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to enable 2FA');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify 2FA setup with a token
   */
  const verifySetup = async (token: string): Promise<TwoFactorVerifyResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.verify2FASetup(token);
      if (response.success) {
        setIs2FAEnabled(true);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to verify 2FA setup');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disable 2FA for the current user
   */
  const disable2FA = async (token: string): Promise<TwoFactorVerifyResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.disable2FA(token);
      if (response.success) {
        setIs2FAEnabled(false);
        setQrCode(null);
        setSecret(null);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate a 2FA token during login
   */
  const validateToken = async (token: string): Promise<TwoFactorVerifyResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.validate2FAToken(token);
      return response;
    } catch (err: any) {
      setError(err.message || 'Invalid 2FA token');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    qrCode,
    secret,
    is2FAEnabled,
    getStatus,
    enable2FA,
    verifySetup,
    disable2FA,
    validateToken
  };
};

export default use2FA;
