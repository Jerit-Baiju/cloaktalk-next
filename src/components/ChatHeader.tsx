'use client';

import { useChat } from '@/contexts/ChatContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoMdExit } from 'react-icons/io';
import { MdNavigateNext } from 'react-icons/md';

const ChatHeader: React.FC = () => {
  const { currentChat } = useChat();
  const router = useRouter();

  if (!currentChat) return null;

  const handleExit = () => {
    // Navigate back to homepage
    router.push('/');
  };

  const handleNext = () => {
    // Navigate to next chat - you might want to implement logic to find the next chat
    // For now, we'll just show an alert
    alert('Next chat functionality to be implemented');
  };

  return (
    <div className='relative z-10 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60'>
      <div className='px-4 sm:px-6 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='relative w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500/30 to-fuchsia-600/30 flex items-center justify-center ring-1 ring-pink-500/40 overflow-hidden'>
            {currentChat.avatar ? (
              <Image src={currentChat.avatar} alt={currentChat.name} width={28} height={28} className='w-7 h-7 object-contain opacity-90' />
            ) : (
              <span className='text-pink-200 font-semibold text-sm'>{currentChat.name.charAt(0)}</span>
            )}
          </div>
          <div className='flex flex-col min-w-0'>
            <h2 className='text-sm font-medium tracking-tight text-neutral-100 truncate'>{currentChat.name}</h2>
            <div className='flex items-center gap-2'>
              {currentChat.isOnline ? (
                <span className='flex items-center gap-1 text-[11px] text-neutral-500'>
                  <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse'></span>
                  Live now
                </span>
              ) : (
                <span className='text-[11px] text-neutral-600'>Offline</span>
              )}
              <span className='hidden sm:inline text-[10px] uppercase tracking-wider text-neutral-600'>Anonymous</span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleNext}
            className='group relative w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-900/60 flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-neutral-600 transition-colors'
            title='Next Chat'>
            <MdNavigateNext className='text-lg' />
          </button>
          <button
            onClick={handleExit}
            className='group relative w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-900/60 flex items-center justify-center text-neutral-400 hover:text-pink-300 hover:border-pink-500/60 transition-colors'
            title='Exit'>
            <IoMdExit className='text-base' />
          </button>
          <button
            className='group relative w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-900/60 flex items-center justify-center text-neutral-500 hover:text-neutral-200 hover:border-neutral-600 transition-colors'
            title='More'>
            <BsThreeDotsVertical className='text-base' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
