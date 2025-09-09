'use client';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [hoverStart, setHoverStart] = useState(false);
  const goLogin = useCallback(() => router.push('/login'), [router]);

  // Redirect to homepage immediately if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  // Suspend rendering while auth is initializing to avoid flicker
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="w-10 h-10 border-4 border-t-pink-500 border-neutral-700 rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    { title: 'Authenticate (Once)', text: 'Quick campus email sign-in. We never show it to others.' },
    { title: 'Enter the Window', text: 'Drop in during your campus\'s designated chat window. The room opens for everyone simultaneously.' },
    { title: 'Pair & Converse', text: 'You get matched or can move between ephemeral chats freely.' },
    { title: 'It Vanishes', text: 'After the window closes, sessions end—no lingering history. You return for the next session.' }
  ];

  const features = [
    { icon: '🔒', title: 'True Anonymity', text: 'No display names. Presence only while you are active.' },
    { icon: '🎓', title: 'Campus Verified', text: 'Access limited to real students through email verification.' },
    { icon: '⚡', title: 'Frictionless', text: 'One tap to start; no profiles, bios, or setup clutter.' },
    { icon: '🕘', title: 'Timed Focus', text: 'Scarcity keeps it intentional, not another endless feed.' },
    { icon: '🧭', title: 'Guided Norms', text: 'Light prompts encourage helpful, respectful exchanges.' },
    { icon: '�', title: 'Organic Flow', text: 'Connect naturally through shared interests and genuine conversation.' }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 relative overflow-x-hidden selection:bg-pink-500/30">
      {/* Background aesthetics */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 w-[55rem] h-[55rem] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[48rem] h-[48rem] bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:46px_46px] opacity-[0.05]" />
        <div className="absolute inset-0 backdrop-[mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={router.refresh}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image src="/logo.png" alt="CloakTalk" width={44} height={44} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-tight text-neutral-50">CloakTalk</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Anonymous Campus Chat</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-10 pb-24 max-w-6xl mx-auto">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700/60 bg-neutral-900/60 px-4 py-2 text-[11px] tracking-wide text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-pink-500" /> Built for real students only
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            The <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">anonymous window</span> your campus actually needs.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
            CloakTalk creates a deliberate time-boxed space where students can seek help, share thoughts, de-stress, and make authentic low-pressure connections—without the baggage of identity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={goLogin}
              onMouseEnter={() => setHoverStart(true)}
              onMouseLeave={() => setHoverStart(false)}
              className="group relative overflow-hidden rounded-full px-9 py-4 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="absolute inset-0 blur-xl bg-pink-500/40 group-hover:bg-pink-500/50 transition-colors" />
              <span className="relative flex items-center justify-center gap-2 text-neutral-50">
                Get Started
                <svg className={`w-4 h-4 transition-transform ${hoverStart ? 'translate-x-1' : ''}`} stroke="currentColor" strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
              </span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-600 max-w-sm pt-4">No endless scrolling. No algorithmic amplification. Just human, time-boxed presence.</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-xl font-semibold tracking-wide text-neutral-200 mb-2">How it works</h2>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent" />
        </div>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="group relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-wide text-pink-300/80">{`0${i + 1}`}</span>
                <span className="w-2 h-2 rounded-full bg-pink-500/60 group-hover:bg-pink-400 transition-colors" />
              </div>
              <h3 className="font-medium text-neutral-100 tracking-tight">{s.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="mb-10 flex items-end justify-between flex-wrap gap-6">
          <div>
            <h2 className="text-xl font-semibold tracking-wide text-neutral-200 mb-2">Why it feels different</h2>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent" />
          </div>
          <div className="text-[11px] text-neutral-500 max-w-xs">Everything is intentionally minimal so the social pressure stays low and intent stays high.</div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <div key={f.title} className="relative rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 flex flex-col gap-4 hover:border-neutral-700/80 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden>{f.icon}</span>
                <h3 className="font-medium tracking-tight text-neutral-100">{f.title}</h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Guidelines */}
      <section id="safety" className="relative z-10 px-6 pb-28 max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-xl font-semibold tracking-wide text-neutral-200 mb-2">Safety & ethos</h2>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
              <p className="text-sm text-neutral-400 leading-relaxed">We want candid conversation—not harassment. Automated classifiers and community signals reduce toxicity. Flagged content is reviewed. Repeat abuse leads to silent removal of access.</p>
              <ul className="grid sm:grid-cols-2 gap-3 text-[13px] text-neutral-300">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> No doxxing / real-world targeting</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> No hate or discrimination</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> No explicit sexual content</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Support peers respectfully</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-medium tracking-tight text-neutral-100">Ready for tonight?</h3>
                <p className="text-sm text-neutral-400">Authenticate early so you can jump straight in when 8 PM hits.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={goLogin} className="rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 px-6 py-3 text-sm font-medium text-neutral-50 hover:from-pink-500 hover:to-rose-500 transition-colors">Sign in</button>
              </div>
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
              <h3 className="font-medium tracking-tight text-neutral-100">Getting Started</h3>
              <p className="text-sm text-neutral-400">Sign in with your campus email to join the conversation during chat windows.</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
              <h3 className="font-medium tracking-tight text-neutral-100">Why one hour?</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Scarcity combats burnout and doom-scrolling. It nudges presence, not passive consumption. You show up because others chose to show up too.</p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="relative z-10 px-6 pb-12 max-w-6xl mx-auto text-[11px] text-neutral-600 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <p>&copy; {new Date().getFullYear()} CloakTalk. Students first.</p>
        <p className="text-neutral-600">Built for mindful, anonymous connection.</p>
      </footer>
    </div>
  );
}