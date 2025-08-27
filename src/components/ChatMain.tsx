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
    <div className="flex-1 bg-gradient-to-b from-gray-50/50 to-white/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-1">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start the conversation</h3>
            <p className="text-gray-500 text-sm">Send a message to begin your anonymous chat</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isGrouped = shouldGroupMessage(index);
          const showTimestamp = shouldShowTimestamp(index);
          
          return (
            <div key={message.id}>
              {/* Timestamp Divider */}
              {showTimestamp && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-gray-400 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} ${
                  isGrouped ? 'mb-1' : 'mb-3'
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg group relative ${
                    message.isMe ? 'order-2' : 'order-1'
                  }`}
                >
                  {/* Message Content */}
                  <div
                    className={`px-4 py-3 rounded-2xl relative transition-all duration-200 ${
                      message.isMe
                        ? `bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md hover:shadow-lg ${
                            isGrouped ? 'rounded-tr-md' : 'rounded-tr-lg'
                          }`
                        : `bg-white border border-gray-100 text-gray-800 shadow-sm hover:shadow-md ${
                            isGrouped ? 'rounded-tl-md' : 'rounded-tl-lg'
                          }`
                    }`}
                  >
                    {/* Message Text */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Message Info */}
                    {!isGrouped && (
                      <div className={`flex items-center justify-between mt-2 space-x-2`}>
                        <span className={`text-xs font-medium ${
                          message.isMe ? 'text-pink-100' : 'text-gray-600'
                        }`}>
                          {message.isMe ? 'You' : message.senderName}
                        </span>
                        <span className={`text-xs ${
                          message.isMe ? 'text-pink-200' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Enhanced Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="max-w-xs sm:max-w-md lg:max-w-lg">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">Anonymous Buddy is typing...</span>
                </div>
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
