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
      <div className="h-screen flex flex-col bg-neutral-950 text-neutral-100 relative overflow-hidden">
        {/* Background aesthetics */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 w-[45rem] h-[45rem] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.14),transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.12),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.05]" />
        </div>

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
