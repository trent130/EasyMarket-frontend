"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api/auth'; // Import the authApi

export default function Manage2FA() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      // In a real app, you'd fetch the user's 2FA status from the server
      // For this example, we'll just use a mock value
      const fetch2FAStatus = async () => {
        try {
          const response = await authApi.getStatus();
          setIs2FAEnabled(response.isEnabled);
        } catch (error: any) {
          setMessage(error.message || 'An error occurred while fetching 2FA status.');
        }
      };
      fetch2FAStatus();
    }
  }, [status, router]);

  const handleDisable2FA = async () => {
    try {
      const response = await authApi.disable();

      if (response.success) {
        setIs2FAEnabled(false);
        setMessage(response.message || '2FA disabled successfully.');
      } else {
        setMessage(response.message || 'Failed to disable 2FA.');
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
    }
  };

  const handleGenerateBackupCodes = async () => {
    //Not implemented this functionallity
    setMessage('Not implimented funcitonallity');
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Manage Two-Factor Authentication</h1>
      {is2FAEnabled ? (
        <div>
          <p className="mb-4">Two-factor authentication is currently enabled for your account.</p>
          <button
            onClick={handleDisable2FA}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Disable 2FA
          </button>
          <div>
            <button
              onClick={handleGenerateBackupCodes}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Generate Backup Codes
            </button>
          </div>
          {backupCodes.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Backup Codes</h2>
              <p className="text-sm text-gray-600 mb-2">
                Store these codes in a safe place. Each code can only be used once.
              </p>
              <ul className="list-disc list-inside">
                {backupCodes.map((code, index) => (
                  <li key={index}>{code}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-4">Two-factor authentication is currently disabled for your account.</p>
          <button
            onClick={() => router.push('/auth/enable-2fa')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Enable 2FA
          </button>
        </div>
      )}
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}