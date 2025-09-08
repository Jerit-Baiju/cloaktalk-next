'use client';

import { useChat } from '@/contexts/ChatContext';
import React, { useEffect, useRef } from 'react';

const ChatMain: React.FC = () => {
  const { messages, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const shouldShowTimestamp = (index: number) => {
    if (index === 0) return true;
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    const timeDiff = currentMessage.timestamp.getTime() - previousMessage.timestamp.getTime();
    return timeDiff > 5 * 60 * 1000; // Show if more than 5 minutes apart
  };

  const shouldGroupMessage = (index: number) => {
    if (index === 0) return false;
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    const timeDiff = currentMessage.timestamp.getTime() - previousMessage.timestamp.getTime();
    return currentMessage.isMe === previousMessage.isMe && timeDiff < 2 * 60 * 1000; // Group if same sender and within 2 minutes
  };

  return (
    <div className="flex-1 relative overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.08),transparent_70%)] opacity-70" />
      <div className="relative max-w-3xl mx-auto space-y-1">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center ring-1 ring-pink-500/30">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-base font-medium text-neutral-200 mb-2 tracking-tight">Start the conversation</h3>
            <p className="text-neutral-500 text-sm">Send a first message to begin your ephemeral exchange.</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isGrouped = shouldGroupMessage(index);
          const showTimestamp = shouldShowTimestamp(index);
          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="flex justify-center my-6">
                  <span className="text-[10px] font-medium tracking-wide text-neutral-500 px-3 py-1 rounded-full bg-neutral-900/70 border border-neutral-800/80">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                </div>
              )}

              <div className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mb-1' : 'mb-4'}`}>                
                <div className={`max-w-xs sm:max-w-md lg:max-w-lg group relative ${message.isMe ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl relative transition-colors duration-200 ${
                      message.isMe
                        ? `bg-gradient-to-br from-pink-500/80 to-fuchsia-600/80 text-neutral-50 shadow-sm ring-1 ring-pink-500/40 hover:ring-pink-400/60 ${isGrouped ? 'rounded-tr-md' : 'rounded-tr-xl'}`
                        : `bg-neutral-900/70 backdrop-blur border border-neutral-800 text-neutral-200 hover:border-neutral-700 ${isGrouped ? 'rounded-tl-md' : 'rounded-tl-xl'}`
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    {!isGrouped && (
                      <div className="flex items-center justify-between mt-2 gap-6">
                        <span className={`text-[10px] font-medium ${message.isMe ? 'text-pink-100/80' : 'text-neutral-400'}`}>{message.isMe ? 'You' : message.senderName}</span>
                        <span className={`text-[10px] ${message.isMe ? 'text-pink-200/70' : 'text-neutral-500'}`}>{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="max-w-xs sm:max-w-md lg:max-w-lg">
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-neutral-900/70 border border-neutral-800 flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-[11px] text-neutral-500">Anonymous Buddy is typing…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMain;
