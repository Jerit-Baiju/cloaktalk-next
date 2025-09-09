'use client';

import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Login() {
  // UI state
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authURL, setAuthURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCalledApiRef = useRef(false);

  const router = useRouter();
  const { isAuthenticated, } = useAuth();

  // Redirect to homepage immediately if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);


  // Auth state for redirects is handled globally in AuthContext
  const { tokenData: authTokens, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only run once on mount to fetch the auth URL when auth state is known
    if (hasCalledApiRef.current) return;

    const initializeAuthUrl = async () => {
      if (authLoading) return; // wait for global auth init

      if (authTokens) {
        // Already authenticated: nothing to do here
        setIsLoading(false);
        return;
      }

      hasCalledApiRef.current = true;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/auth_url/`);
        const data = await response.json();
        setAuthURL(data.url);
      } catch (e) {
        console.error('Failed to fetch auth URL:', e);
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 relative overflow-x-hidden selection:bg-pink-500/30">
      {/* Background aesthetics to match welcome/home */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 w-[55rem] h-[55rem] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[48rem] h-[48rem] bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:46px_46px] opacity-[0.05]" />
        <div className="absolute inset-0 backdrop-[mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image src="/logo.png" alt="CloakTalk" width={44} height={44} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-tight text-neutral-50">CloakTalk</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Anonymous Campus Chat</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 px-6 pt-26 pb-16">
        <div className="max-w-md mx-auto">
          {/* Card */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            {/* Brand */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <Image src="/logo.png" alt="CloakTalk" width={48} height={48} />
                </div>
                <span className="text-2xl font-semibold tracking-tight text-neutral-100">CloakTalk</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-neutral-400 text-sm mt-1">Sign in with your campus Google account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10" /><path d="M12 7v6" /><path d="M12 17h.01" /></svg>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Google button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || loading || !authURL}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative overflow-hidden w-full rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="absolute inset-0 blur-xl bg-pink-500/40 group-hover:bg-pink-500/50 transition-colors" />
              <span className="relative z-10 flex items-center justify-center text-neutral-50">
                {isLoading || loading ? (
                  <>
                    <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0A12 12 0 000 12h4zm2 5.291A7.962 7.962 0 014 12H0A12 12 0 0012 24v-4a8 8 0 01-6-2.709z"></path>
                    </svg>
                    {isLoading ? 'Loading…' : 'Redirecting…'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                    <svg className={`ml-2 w-4 h-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-2 bg-neutral-900/80 text-neutral-400">Why Google?</span>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-pink-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                <div>
                  <h3 className="text-sm font-medium text-neutral-100 mb-1">College email verification</h3>
                  <p className="text-xs text-neutral-400">We verify you belong to your campus using your Google account. We don’t expose your identity to others.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-[11px] text-neutral-500">
              By signing in, you agree to our <a className="text-pink-300 hover:text-pink-200" href="#">Terms of Service</a> and <a className="text-pink-300 hover:text-pink-200" href="#">Privacy Policy</a>.
            </div>
          </div>

          {/* Back link */}
          <div className="text-center mt-6">
            <Link href="/" className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
