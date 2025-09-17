'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, useChatWebSocket } from '@/contexts/ChatWebSocketContext';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

// Small helper to show a countdown and fire onFinish after given seconds
function AutoRedirect({ seconds, onFinish }: { seconds: number; onFinish: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const tick = setInterval(() => setRemaining((s) => (s > 1 ? s - 1 : 1)), 1000);
    const timer = setTimeout(onFinish, seconds * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(timer);
    };
  }, [seconds, onFinish]);
  return <span className='text-xs text-neutral-500'>Auto in {remaining}s</span>;
}

export default function ChatComponent() {
  const { user } = useAuth();
  const {
    currentChat,
    sendMessage,
    endChat,
    isConnected: isChatConnected,
    connectToChat,
    otherUserTyping,
    startTyping,
    stopTyping,
    participantStatuses,
  } = useChatWebSocket();
  const params = useParams();
  const chatId = useMemo(() => (params?.uuid as string) || '', [params]);
  const router = useRouter();
  const [messageInput, setMessageInput] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const [deadChat, setDeadChat] = useState<null | 'not_found' | 'forbidden' | 'ended'>(null);
  const [redirectSeconds, setRedirectSeconds] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const connectToChatRef = useRef<typeof connectToChat | null>(null);

  // Keep the ref updated with the latest connectToChat function
  useEffect(() => {
    connectToChatRef.current = connectToChat;
  }, [connectToChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Attempt to connect to chat by URL id when arriving directly
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let countdown: NodeJS.Timeout | null = null;
    const run = async () => {
      if (!currentChat && chatId && connectToChatRef.current) {
        const result = await connectToChatRef.current(chatId);
        if (result === 'not_found' || result === 'forbidden') {
          setDeadChat(result);
        }
      }
    };
    run();

    // If dead chat detected or chat ended, schedule redirect
    if (deadChat || (!currentChat && !isChatConnected && chatId)) {
      setRedirectSeconds(3); // Reset to 3 seconds
      timer = setTimeout(() => router.replace('/queue'), 3000);
      countdown = setInterval(() => setRedirectSeconds((s) => (s > 1 ? s - 1 : 0)), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (countdown) clearInterval(countdown);
    };
  }, [chatId, currentChat, isChatConnected, router, deadChat]); // Removed connectToChat to prevent infinite loop

  // Handle chat ending - redirect when chat becomes null due to ending
  useEffect(() => {
    if (!currentChat && isEnding) {
      // Chat was ended by user, redirect after a short delay
      const timer = setTimeout(() => {
        router.replace('/queue');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentChat, isEnding, router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (messageInput.trim() && isChatConnected) {
      sendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    // Start typing indicator when user starts typing
    if (e.target.value.trim() && isChatConnected) {
      startTyping();
    } else if (!e.target.value.trim()) {
      stopTyping();
    }
  };

  const handleInputBlur = () => {
    // Stop typing when input loses focus
    stopTyping();
  };

  const handleEndChat = async () => {
    setIsEnding(true);
    // send end event, but stay on page showing confirmation and controls
    endChat();
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className='h-screen flex items-center justify-center bg-neutral-950 text-neutral-200'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-42 h-22 rounded-xl flex items-center justify-center animate-pulse'>
            <Image src='/logo.png' alt='Logo' width={100} height={100} />
          </div>
          <p className='text-sm tracking-wide text-neutral-400'>Preparing your cloak…</p>
        </div>
      </div>
    );
  }

  if (!currentChat) {
    const title = deadChat === 'not_found' || deadChat === 'forbidden' ? 'This chat is no longer available' : 'Connecting…';
    const desc = deadChat ? 'The other participant has left or the chat has ended.' : 'Connecting to your conversation';
    return (
      <div className='flex items-center justify-center min-h-screen bg-neutral-950 text-neutral-200'>
        <div className='max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center'>
          {!deadChat ? (
            <div className='animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4' />
          ) : (
            <div className='w-12 h-12 mx-auto mb-4 bg-red-500/15 text-red-300 rounded-full flex items-center justify-center'>!</div>
          )}
          <h3 className='text-lg font-semibold text-neutral-100 mb-2'>{title}</h3>
          <p className='text-neutral-400'>{desc}</p>
          {(deadChat || (!isChatConnected && chatId)) && (
            <div className='mt-4 text-sm text-neutral-400'>Redirecting to queue in {redirectSeconds}s…</div>
          )}
          <button
            onClick={() => router.replace('/queue')}
            className='mt-5 inline-flex items-center justify-center rounded-full border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/15 text-pink-200 text-sm font-medium px-5 py-2 transition-colors'>
            Go to Queue now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen bg-neutral-950 text-neutral-100'>
      {/* Header */}
      <div className='bg-neutral-900/70 border-b border-neutral-800 px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center'>
          <img className='h-12' src={`https://api.dicebear.com/9.x/personas/svg?seed=${chatId}`} alt='' />
          {/* Online status indicator */}
          <div>
            <h1 className='text-lg font-semibold text-neutral-100'>Anonymous Chat</h1>
            <p className='text-sm text-neutral-400'>
              {currentChat.college}
              {participantStatuses.length > 0 && (
                <span className='ml-2'>
                  • {participantStatuses.some((p) => p.user_id !== user?.id?.toString() && p.is_online) ? 'Online' : 'Offline'}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {/* End Chat Button */}
          {!isEnding ? (
            <button
              onClick={handleEndChat}
              className='border border-red-500/40 bg-red-500/10 hover:bg-red-500/15 text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
              End Chat
            </button>
          ) : (
            <div className='flex items-center gap-2 text-red-300 text-sm'>
              <span className='w-3 h-3 animate-pulse rounded-full bg-red-400' />
              Ending…
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {currentChat.messages.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 mx-auto bg-pink-500/10 rounded-full flex items-center justify-center mb-4'>
              <svg className='w-8 h-8 text-pink-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
              </svg>
            </div>
            <p className='text-neutral-400'>Start the conversation! Send your first message.</p>
          </div>
        ) : (
          currentChat.messages.map((message: ChatMessage, index: number) => (
            <div key={message.id || index} className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.message_type === 'system'
                    ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 text-center text-sm mx-auto'
                    : message.is_own
                    ? 'bg-pink-600 text-white rounded-br-none'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-bl-none'
                }`}>
                <p className='break-words'>{message.content}</p>
                {message.message_type !== 'system' && (
                  <p className={`text-xs mt-1 ${message.is_own ? 'text-pink-100' : 'text-neutral-500'}`}>
                    {formatMessageTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className='bg-neutral-900 border-t border-neutral-800 px-4 py-3'>
        {isEnding && (
          <div className='mb-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-neutral-300'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
              <div>Chat ended. You can return to the queue now.</div>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => router.replace('/queue')}
                  className='inline-flex items-center justify-center rounded-full border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/15 text-pink-200 text-xs font-medium px-4 py-1.5 transition-colors'>
                  Go to Queue now
                </button>
                <AutoRedirect seconds={3} onFinish={() => router.replace('/queue')} />
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className='flex space-x-2'>
          <div className='flex-1 relative'>
            <input
              ref={inputRef}
              inputMode='text'
              autoComplete='off'
              autoCorrect='off'
              spellCheck={false}
              type='text'
              value={messageInput}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder='Type your message...'
              disabled={!isChatConnected}
              className='w-full px-4 py-2 border border-neutral-800 rounded-lg bg-neutral-950 text-neutral-100 placeholder:text-neutral-600 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-neutral-900 disabled:text-neutral-500 disabled:cursor-not-allowed'
              maxLength={500}
            />
            {/* Typing indicator */}
            {otherUserTyping && (
              <div className='absolute -top-8 left-4 text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded'>
                Other user is typing...
              </div>
            )}
          </div>
          <button
            type='submit'
            disabled={!messageInput.trim() || !isChatConnected}
            className='bg-pink-600 hover:bg-pink-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
            </svg>
          </button>
        </form>

        {/* Character count */}
        <div className='flex justify-between items-center mt-2 text-xs text-neutral-500'>
          <p>Messages are anonymous and private</p>
          <p>{messageInput.length}/500</p>
        </div>
      </div>
    </div>
  );
}
