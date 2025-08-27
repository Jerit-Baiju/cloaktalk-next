'use client';

import { useChat } from '@/contexts/ChatContext';
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
    <div className='bg-gradient-to-r from-pink-500 to-rose-600 p-4 border-b border-gray-100'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
            {currentChat.avatar ? (
              <img src={currentChat.avatar} alt={currentChat.name} className='w-8 h-8 rounded-full' />
            ) : (
              <div className='w-8 h-8 bg-white/40 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-semibold'>{currentChat.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <h2 className='font-semibold text-white text-lg'>{currentChat.name}</h2>
            {currentChat.isOnline && (
              <div className='text-xs text-pink-100 flex items-center'>
                <div className='w-2 h-2 bg-green-400 rounded-full mr-1.5'></div>
                online now
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            onClick={handleExit}
            className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors'
            title='Exit Chat'>
            <IoMdExit className='text-white text-lg' />
          </button>

          <button
            onClick={handleNext}
            className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors'
            title='Next Chat'>
            <MdNavigateNext className='text-white text-lg' />
          </button>

          <button className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors'>
            <BsThreeDotsVertical className='text-white text-lg' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
