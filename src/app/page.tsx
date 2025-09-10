'use client';

import { useAccessControl } from '@/contexts/AccessControlContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { canAccess, loading: accessLoading, accessData } = useAccessControl();
  const router = useRouter();

  useEffect(() => {
    if (loading || accessLoading) return;

    // If not authenticated, redirect to welcome
    if (!isAuthenticated) {
      router.replace('/welcome');
      return;
    }

    // Otherwise, stay on the homepage (lobby). No auto-redirect to queue.
  }, [isAuthenticated, canAccess, loading, accessLoading, router]);

  // Show loading state while checking authentication and access
  if (loading || accessLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950 text-neutral-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-42 h-22 rounded-xl flex items-center justify-center animate-pulse">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </div>
          <p className="text-sm tracking-wide text-neutral-400">Preparing your cloak…</p>
        </div>
      </div>
    );
  }
  // OG UI as lobby. No auto-redirect to /queue; button controls navigation.
  return (
    <div className="h-screen relative overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-pink-500/30">
      {/* Subtle radial gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[45rem] h-[45rem] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.07]" />
      </div>

      {/* Top bar */}
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

      {/* Main hero */}
      <main className="relative z-10 h-[calc(100vh-72px)] flex flex-col items-center justify-center px-6 text-center">
        {isAuthenticated && !canAccess && accessData && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[min(92vw,680px)] bg-neutral-900/80 border border-neutral-700/60 rounded-xl p-4 text-sm text-neutral-300 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
              <div>
                {accessData.reason === 'outside_window' && (
                  <>
                    You’re early — opens{' '}
                    <span className="text-neutral-100 font-medium">
                      {accessData.window_start?.slice(0, 5)} – {accessData.window_end?.slice(0, 5)}
                    </span>
                    .
                  </>
                )}
                {accessData.reason === 'college_inactive' && (
                  <>
                    {accessData.college_name}: <span className="text-red-400">Not live yet</span>
                  </>
                )}
                {accessData.reason === 'no_college' && (
                  <>We couldn’t confirm your campus for this account.</>
                )}
                {!['outside_window', 'college_inactive', 'no_college'].includes(accessData.reason as string) && (
                  <>{accessData.message}</>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] bg-gradient-to-br from-neutral-50 via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              <span className="block sm:inline">Speak freely.</span>
              <br className="hidden sm:block" />
              <span className="block sm:inline bg-gradient-to-r from-pink-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">Stay invisible.</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              One focused hour each night to connect with real students from your campus—no names, no judgment, just honest conversation.
            </p>
          </div>

          {/* Availability State */}
          {canAccess ? (
            <div className="space-y-6">
              <div className="text-xs uppercase tracking-[0.25em] text-pink-300/70 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" /> Live Window
              </div>
              <div>
                <button
                  onClick={() => router.push('/queue')}
                  className="group relative overflow-hidden rounded-full px-10 py-4 text-sm font-medium tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute inset-0 blur-xl bg-pink-500/40 group-hover:bg-pink-500/50 transition-colors" />
                  <span className="relative flex items-center justify-center gap-2 text-neutral-50">
                    Start Chat
                    <svg className="w-4 h-4" stroke="currentColor" strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
                <p className="mt-3 text-xs text-neutral-400">You’ll be redirected to chat automatically once matched.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="text-xs uppercase tracking-[0.25em] text-neutral-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-600" /> Window Closed
                </div>
                <p className="text-neutral-400 text-sm max-w-sm leading-relaxed">
                  CloakTalk opens nightly from{' '}
                  <span className="text-neutral-200 font-medium">
                    {accessData?.window_start?.slice(0, 5) || '20:00'} - {accessData?.window_end?.slice(0, 5) || '21:00'}
                  </span>{' '}
                  local time.
                </p>
              </div>
            </div>
          )}

          {/* Micro value props */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 text-[11px] text-neutral-500">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-neutral-300">🔒</span> No profiles
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-neutral-300">🎓</span> Campus only
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-neutral-300">⚡</span> Instant pairing
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-neutral-300">🕘</span> 1 hour focus
            </div>
          </div>

          <p className="pt-8 text-[11px] text-neutral-600 max-w-xs mx-auto leading-relaxed">
            Be respectful. Conversations are ephemeral and lightly moderated for safety.
          </p>
        </div>
      </main>
    </div>
  );
}
