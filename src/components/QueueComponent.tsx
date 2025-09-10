'use client';

import { useAccessControl } from '@/contexts/AccessControlContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChatWebSocket } from '@/contexts/ChatWebSocketContext';
import { useQueueWebSocket } from '@/contexts/QueueWebSocketContext';
import { useAxios } from '@/lib/useAxios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function QueueComponent() {
  const { user } = useAuth();
  const { canAccess, accessData } = useAccessControl();
  const { get } = useAxios();
  const {
    queueStatus,
    isInQueue,
    joinQueue,
    leaveQueue,
    isConnected: isQueueConnected,
    onlineUsers,
  } = useQueueWebSocket();
  const { currentChat } = useChatWebSocket();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [activity, setActivity] = useState<{ active_chats: number; waiting_count: number; college?: string } | null>(null);
  const autoJoinAttempted = useRef(false);

  // Redirect to chat if user has an active chat
  useEffect(() => {
    if (currentChat) {
      router.push(`/chat/${currentChat.chat_id}`);
    }
  }, [currentChat, router]);

  // Listen for chat matched events from queue WebSocket
  useEffect(() => {
    const handleChatMatched = (event: CustomEvent) => {
      const { chatId } = event.detail;
      if (chatId) {
        console.log('Queue matched chat:', chatId);
        router.push(`/chat/${chatId}`);
      }
    };

    window.addEventListener('chatMatched', handleChatMatched as EventListener);
    return () => window.removeEventListener('chatMatched', handleChatMatched as EventListener);
  }, [router]);

  const handleJoinQueue = useCallback(async () => {
    setIsJoining(true);
    joinQueue();
    // The isJoining state will be reset when we get the queue status update
  }, [joinQueue]);

  const handleLeaveQueue = () => {
    leaveQueue();
    setIsJoining(false);
  };

  // Reset joining state when queue status changes
  useEffect(() => {
    if (queueStatus && isJoining) {
      setIsJoining(false);
    }
  }, [queueStatus, isJoining]);

  // Auto-join queue on load when connected and within access window
  useEffect(() => {
    if (!autoJoinAttempted.current && isQueueConnected && canAccess && !isInQueue) {
      autoJoinAttempted.current = true;
      handleJoinQueue();
    }
  }, [isQueueConnected, canAccess, isInQueue, handleJoinQueue]);

  // Fetch college activity (active chats + waiting) and refresh periodically
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const fetchActivity = async () => {
      try {
        const res = await get<{ college: string; college_id: number; active_chats: number; waiting_count: number }>(
          '/api/college/activity/'
        );
        if (res.data) {
          setActivity({
            active_chats: res.data.active_chats,
            waiting_count: res.data.waiting_count,
            college: res.data.college,
          });
        }
  } catch {
        // ignore transient errors
      }
    };

    if (user) {
      fetchActivity();
      interval = setInterval(fetchActivity, 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, get]);

  if (!user) {
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

  if (!user.college) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950 text-neutral-300">
        <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/15 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-100 mb-2">No College Assigned</h3>
          <p className="text-neutral-400">You need to be assigned to a college to join the queue.</p>
        </div>
      </div>
    );
  }

  const windowClosed = !canAccess && accessData?.reason === 'outside_window';

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden bg-neutral-950 text-neutral-100 selection:bg-pink-500/30">
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

      {/* Main */}
      <main className="relative z-10 flex items-center justify-center px-6 md:mt-12">
        <div className="w-[min(92vw,760px)] mx-auto">
          {/* Stats card */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 backdrop-blur mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-neutral-50">{user.college?.name}</h2>
                <p className="text-neutral-400 text-sm">Campus activity</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500">Chatting now</div>
                  <div className="mt-1 text-2xl font-semibold text-pink-300">
                    {activity ? activity.active_chats : '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500">Waiting</div>
                  <div className="mt-1 text-2xl font-semibold text-neutral-200">
                    {queueStatus ? queueStatus.waiting_count : activity ? activity.waiting_count : '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 hidden sm:block">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500">Window</div>
                  <div className="mt-1 text-sm font-medium text-neutral-300">
                    {accessData?.window_start?.slice(0,5)}–{accessData?.window_end?.slice(0,5)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Queue card */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 backdrop-blur">
            {windowClosed ? (
              <div className="text-center space-y-3">
                <div className="text-xs uppercase tracking-[0.25em] text-neutral-500 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-600" /> Window Closed
                </div>
                <p className="text-neutral-400 text-sm">
                  Opens {accessData?.window_start?.slice(0,5)} – {accessData?.window_end?.slice(0,5)} local time.
                </p>
              </div>
            ) : (
              <div className="text-center">
                {!isInQueue ? (
                  <div className="max-w-sm mx-auto">
                    <button
                      onClick={handleJoinQueue}
                      disabled={isJoining || !isQueueConnected}
                      className="group relative overflow-hidden rounded-full w-full px-8 py-3.5 text-sm font-medium tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-60"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute inset-0 blur-xl bg-pink-500/40 group-hover:bg-pink-500/50 transition-colors" />
                      <span className="relative flex items-center justify-center gap-2 text-neutral-50">
                        {isJoining ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Joining…
                          </>
                        ) : (
                          <>Join Queue</>
                        )}
                      </span>
                    </button>
                    <p className="mt-3 text-xs text-neutral-500">You’ll be redirected to chat automatically once matched.</p>
                  </div>
                ) : (
                  <div className="space-y-5 max-w-md mx-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        <span className="text-sm font-medium">You’re in the queue</span>
                      </div>
                      <p className="mt-1 text-neutral-500 text-sm">Waiting for a match from {user.college?.name}…</p>
                    </div>

                    <button
                      onClick={handleLeaveQueue}
                      className="w-full rounded-full border border-red-500/40 bg-red-500/10 hover:bg-red-500/15 text-red-200 text-sm font-medium py-3 transition-colors"
                    >
                      Leave Queue
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-neutral-200 mb-4">How it works</h4>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                <div className="text-[11px] uppercase tracking-wider text-neutral-500">Step 1</div>
                <p className="mt-1 text-neutral-300">Join the queue for your campus</p>
              </div>
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                <div className="text-[11px] uppercase tracking-wider text-neutral-500">Step 2</div>
                <p className="mt-1 text-neutral-300">Get paired with another student</p>
              </div>
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                <div className="text-[11px] uppercase tracking-wider text-neutral-500">Step 3</div>
                <p className="mt-1 text-neutral-300">Chat anonymously and safely</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
