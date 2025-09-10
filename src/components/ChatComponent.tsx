'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, useWebSocket } from '@/contexts/WebSocketContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ChatComponent() {
  const { user } = useAuth();
  const { 
    currentChat, 
    sendMessage, 
    endChat, 
    isChatConnected 
  } = useWebSocket();
  const router = useRouter();
  const [messageInput, setMessageInput] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Redirect if no chat
  useEffect(() => {
    if (!currentChat && isChatConnected) {
      router.push('/queue');
    }
  }, [currentChat, isChatConnected, router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageInput.trim() && isChatConnected) {
      sendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const handleEndChat = async () => {
    setIsEnding(true);
    endChat();
    
    // Give some time for the WebSocket to process
    setTimeout(() => {
      setIsEnding(false);
      router.push('/queue');
    }, 1000);
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Chat...</h3>
          <p className="text-gray-600">Connecting to your conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Anonymous Chat</h1>
            <p className="text-sm text-gray-500">{currentChat.college}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isChatConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
              isChatConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isChatConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          {/* End Chat Button */}
          <button
            onClick={handleEndChat}
            disabled={isEnding}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
          >
            {isEnding ? 'Ending...' : 'End Chat'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat.messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500">Start the conversation! Send your first message.</p>
          </div>
        ) : (
          currentChat.messages.map((message: ChatMessage, index: number) => (
            <div key={message.id || index} className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.message_type === 'system'
                  ? 'bg-gray-100 text-gray-600 text-center text-sm mx-auto'
                  : message.is_own
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
              }`}>
                <p className="break-words">{message.content}</p>
                {message.message_type !== 'system' && (
                  <p className={`text-xs mt-1 ${message.is_own ? 'text-blue-100' : 'text-gray-500'}`}>
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
      <div className="bg-white border-t px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            disabled={!isChatConnected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || !isChatConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        
        {/* Character count */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <p>Messages are anonymous and private</p>
          <p>{messageInput.length}/500</p>
        </div>
      </div>
    </div>
  );
}
