"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const [status, setStatus] = useState('Verifying...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        //const response = await fetch(`/marketplace/verify-email?token=${token}`);
        //const data = await response.json();
        //setStatus("Not implimented")

        //if (response.ok) {
        //  setStatus(data.message);
        //} else {
        //  setStatus(data.error || 'An error occurred during verification');
        //}
        setStatus("this feature is still not implimented please login in the app to continue")
      } catch (error) {
        setStatus('An error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Verification</h2>
        <p className="mt-2 text-center text-sm text-gray-600">{status}</p>
        <div className="mt-5 text-center">
          <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}