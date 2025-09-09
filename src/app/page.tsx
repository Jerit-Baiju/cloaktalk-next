'use client';

import { useAccessControl } from '@/contexts/AccessControlContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { canAccess, accessData, loading: accessLoading } = useAccessControl();
  const router = useRouter();

  const [now, setNow] = useState<Date>(() => new Date());
  const [hover, setHover] = useState(false);

  // Tick every second for countdown / state freshness
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Calculate if we should show as "open" based on access control
  const isOpen = useMemo(() => {
    return isAuthenticated && canAccess;
  }, [isAuthenticated, canAccess]);

  // Calculate countdown based on access data or fallback to local time
  const countdown = useMemo(() => {
    if (isOpen) return 'Starting now';

    // If we have window timing from backend, use it
    if (accessData?.window_start && accessData?.window_end) {
      const [startHour, startMin] = accessData.window_start.split(':').map(Number);
      const [endHour, endMin] = accessData.window_end.split(':').map(Number);
      
      const nextStart = new Date(now);
      if (now.getHours() > endHour || (now.getHours() === endHour && now.getMinutes() >= endMin)) {
        // Tomorrow's window
        nextStart.setDate(nextStart.getDate() + 1);
      }
      nextStart.setHours(startHour, startMin, 0, 0);
      
      const msUntil = nextStart.getTime() - now.getTime();
      if (msUntil <= 0) return 'Starting now';
      
      const totalSeconds = Math.floor(msUntil / 1000);
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      const parts = [] as string[];
      if (hrs) parts.push(`${hrs}h`);
      if (hrs || mins) parts.push(`${mins}m`);
      parts.push(`${secs}s`);
      
      return parts.join(' ');
    }

    // Fallback to hardcoded times (8-9 PM)
    const OPEN_HOUR_START = 20; // 8 PM
    const OPEN_HOUR_END = 21;   // 9 PM (exclusive)
    
    const next = new Date(now);
    if (now.getHours() >= OPEN_HOUR_END) {
      // Tomorrow 8:00 PM
      next.setDate(next.getDate() + 1);
    }
    next.setHours(OPEN_HOUR_START, 0, 0, 0);
    const msUntil = next.getTime() - now.getTime();
    
    if (msUntil <= 0) return 'Starting now';
    
    const totalSeconds = Math.floor(msUntil / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const parts = [] as string[];
    if (hrs) parts.push(`${hrs}h`);
    if (hrs || mins) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
  }, [now, isOpen, accessData]);

  const startChat = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!canAccess) {
      // Show access denied message or redirect
      return;
    }
    
    // Prefer crypto for stronger randomness
    const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : 'anonymous-' + Math.random().toString(36).slice(2, 11);
    router.push(`/chat/${uuid}`);
  }, [isAuthenticated, canAccess, router]);

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

  // Show access denied message if authenticated but cannot access
  if (isAuthenticated && !canAccess && accessData) {
    return (
      <div className="h-screen relative overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-pink-500/30">
        {/* Subtle radial gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[45rem] h-[45rem] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15),transparent_70%)]" />
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

        {/* Main content */}
        <main className="relative z-10 h-[calc(100vh-72px)] flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] bg-gradient-to-br from-neutral-50 via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                Access Currently Restricted
              </h1>
              <div className="bg-neutral-900/60 border border-neutral-700/60 rounded-2xl p-8 max-w-2xl mx-auto">
                <p className="text-lg text-neutral-300 mb-4">
                  {accessData.message}
                </p>
                
                {accessData.reason === 'college_inactive' && (
                  <div className="text-sm text-neutral-400 space-y-2">
                    <p>Your college: <span className="text-neutral-200">{accessData.college_name}</span></p>
                    <p>Status: <span className="text-red-400">Currently disabled</span></p>
                    <p className="mt-4">Contact your administrator to enable access for your institution.</p>
                  </div>
                )}
                
                {accessData.reason === 'outside_window' && (
                  <div className="text-sm text-neutral-400 space-y-2">
                    <p>Your college: <span className="text-neutral-200">{accessData.college_name}</span></p>
                    <p>Access window: <span className="text-neutral-200">
                      {accessData.window_start?.slice(0, 5)} - {accessData.window_end?.slice(0, 5)}
                    </span></p>
                    <div className="text-neutral-300 font-mono text-sm bg-neutral-800/60 border border-neutral-700/60 rounded-full px-5 py-2 mt-4">
                      Next session in: <span className="text-pink-300">{countdown}</span>
                    </div>
                  </div>
                )}
                
                {accessData.reason === 'no_college' && (
                  <div className="text-sm text-neutral-400">
                    <p>Please contact support to associate your account with a college.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {isOpen ? (
            <div className="space-y-6">
              <div className="text-xs uppercase tracking-[0.25em] text-pink-300/70 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" /> Live Window
              </div>
              <div>
                <button
                  onClick={startChat}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  className="group relative overflow-hidden rounded-full px-10 py-4 text-sm font-medium tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute inset-0 blur-xl bg-pink-500/40 group-hover:bg-pink-500/50 transition-colors" />
                  <span className="relative flex items-center justify-center gap-2 text-neutral-50">
                    Start Anonymous Chat
                    <svg
                      className={`w-4 h-4 transition-transform ${hover ? 'translate-x-1' : ''}`}
                      stroke="currentColor" strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
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
                <div className="text-neutral-300 font-mono text-sm bg-neutral-800/60 border border-neutral-700/60 rounded-full px-5 py-2">
                  Next session in: <span className="text-pink-300">{countdown}</span>
                </div>
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
