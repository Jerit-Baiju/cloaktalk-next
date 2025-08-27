'use client';

import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ChatMain from '@/components/ChatMain';
import { ChatProvider } from '@/contexts/ChatContext';
import { useParams } from 'next/navigation';
import React from 'react';

const ChatPage: React.FC = () => {
  const params = useParams();
  const chatUuid = params.uuid as string;

  return (
    <ChatProvider>
      <div className="h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
        {/* Chat Header */}
        <ChatHeader />
        
        {/* Chat Messages Area */}
        <ChatMain />
        
        {/* Chat Input */}
        <ChatInput />
      </div>
    </ChatProvider>
  );
};

export default ChatPage;
