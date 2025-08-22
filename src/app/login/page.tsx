'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authURL, setAuthURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCalledApiRef = useRef(false);
  const { tokenData: authTokens, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only run once on mount
    if (hasCalledApiRef.current) {
      return;
    }

    const initializeAuthUrl = async () => {
      // Wait for auth loading to complete
      if (authLoading) {
        return;
      }

      // If user is already authenticated, no need to fetch auth URL
      if (authTokens) {
        setIsLoading(false);
        return;
      }

      // Mark as called to prevent multiple calls
      hasCalledApiRef.current = true;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/auth_url/`);
        const data = await response.json();
        setAuthURL(data.url);
      } catch (error) {
        console.error('Failed to fetch auth URL:', error);
        setError('Failed to load authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthUrl();
  }, [authTokens, authLoading]);

  const handleGoogleSignIn = () => {
    if (authURL) {
      setLoading(true);
      window.location.href = authURL;
    } else {
      setError('Authentication URL not ready. Please try again.');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center px-4'>
      {/* Floating Elements for Visual Appeal */}
      <div className='hidden sm:block absolute top-20 left-20 w-16 h-16 lg:w-20 lg:h-20 bg-pink-200 rounded-full animate-float opacity-60'></div>
      <div
        className='hidden sm:block absolute bottom-20 right-20 w-24 h-24 lg:w-32 lg:h-32 bg-pink-100 rounded-full animate-float opacity-40'
        style={{ animationDelay: '2s' }}></div>
      <div className='hidden sm:block absolute top-1/2 left-10 w-12 h-12 lg:w-16 lg:h-16 bg-pink-300 rounded-full animate-pulse-slow opacity-50'></div>

      {/* Login Card */}
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-xl p-8 sm:p-10 relative z-10'>
          {/* Logo and Brand */}
          <div className='text-center mb-8'>
            <div className='flex items-center justify-center space-x-3 mb-4'>
              <div className='w-12 h-12 rounded-lg flex items-center justify-center'>
                <img src='/logo.png' alt='Cloak Talk Logo' className='w-full h-full' />
              </div>
              <span className='text-2xl font-bold text-gray-900'>Cloak Talk</span>
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
            <p className='text-gray-600'>Sign in to connect with your college community</p>
          </div>

          {/* Google Sign-In Button */}
          <div className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='flex items-center'>
                  <svg className='w-5 h-5 text-red-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || loading || !authURL}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className='group relative w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'>
              <span className='relative z-10 flex items-center justify-center'>
                {isLoading ? (
                  <>
                    <svg className='w-5 h-5 mr-3 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Loading...
                  </>
                ) : loading ? (
                  <>
                    <svg className='w-5 h-5 mr-3 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Redirecting...
                  </>
                ) : (
                  <>
                    <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
                      <path
                        fill='currentColor'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='currentColor'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='currentColor'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='currentColor'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    Continue with Google
                    <svg
                      className={`ml-2 w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                    </svg>
                  </>
                )}
              </span>
              <div className='absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </button>

            {/* Divider */}
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Why Google?</span>
              </div>
            </div>

            {/* Info Section */}
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                  <svg className='w-5 h-5 text-pink-500 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-900 mb-1'>College Email Verification</h3>
                  <p className='text-xs text-gray-600'>
                    We use your college Google account to verify you're part of the campus community and ensure a safe environment for
                    all students.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-8 text-center'>
            <p className='text-xs text-gray-500'>
              By signing in, you agree to our{' '}
              <a href='#' className='text-pink-500 hover:text-pink-600 transition-colors'>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href='#' className='text-pink-500 hover:text-pink-600 transition-colors'>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className='text-center mt-6'>
          <a
            href='/'
            className='text-gray-600 hover:text-pink-500 transition-colors text-sm flex items-center justify-center space-x-1'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            <span>Back to Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
