'use client';

import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
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
      <div className="h-screen relative overflow-hidden bg-neutral-950 text-neutral-100">
        {/* Subtle radial gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-180 h-180 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-160 h-160 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[40px_40px] opacity-[0.07]" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-42 h-22 rounded-xl flex items-center justify-center animate-pulse">
              <Image src="/logo.png" alt="Logo" width={100} height={100} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-neutral-50">Signing you in...</h2>
              <p className="text-sm tracking-wide text-neutral-400">
                Please wait while we complete your authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen relative overflow-hidden bg-neutral-950 text-neutral-100">
        {/* Subtle radial gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-180 h-180 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-160 h-160 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[40px_40px] opacity-[0.07]" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-red-500/20 rounded-full h-16 w-16 flex items-center justify-center border border-red-500/30">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-neutral-50">Authentication Failed</h2>
                <p className="text-neutral-400 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function LoadingFallback() {
  return (
    <div className="h-screen relative overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Subtle radial gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-180 h-180 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-160 h-160 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[40px_40px] opacity-[0.07]" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-42 h-22 rounded-xl flex items-center justify-center animate-pulse">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </div>
          <p className="text-sm tracking-wide text-neutral-400">Preparing your cloak…</p>
        </div>
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
