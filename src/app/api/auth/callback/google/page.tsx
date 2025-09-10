'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function GoogleCallbackContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const hasProcessedRef = useRef(false); // Prevent multiple executions

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple simultaneous executions (especially in React StrictMode)
      if (hasProcessedRef.current) {
        return;
      }

      hasProcessedRef.current = true;

      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        await login(code);
        // login function will handle redirect to home page
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        console.error('OAuth callback error:', err);
        // Redirect to login page with error after 3 seconds
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center px-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4'></div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Signing you in...</h2>
          <p className='text-gray-600'>Please wait while we complete your authentication.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center px-4'>
        <div className='text-center max-w-md'>
          <div className='bg-red-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4'>
            <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
            </svg>
          </div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Authentication Failed</h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <p className='text-sm text-gray-500'>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
}

function LoadingFallback() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center px-4'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4'></div>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>Loading...</h2>
        <p className='text-gray-600'>Please wait...</p>
      </div>
    </div>
  );
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
