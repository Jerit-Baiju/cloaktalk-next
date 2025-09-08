'use client';

import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isSafari, setIsSafari] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const anonymousChatTips = [
    "💬 Connect with classmates without revealing your identity",
    "🔒 Share thoughts freely in a secure environment", 
    "🎓 Find study partners from your college anonymously",
    "💡 Get honest advice from your campus community"
  ];

  useEffect(() => {
    // Detect Safari browser
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariBrowser = userAgent.includes('safari') && !userAgent.includes('chrome');
    setIsSafari(isSafariBrowser);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % anonymousChatTips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [anonymousChatTips.length]);

  const handleStartAnonymousChat = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Generate a random UUID for anonymous chat session
    const chatUuid = 'anonymous-' + Math.random().toString(36).substr(2, 9);
    router.push(`/chat/${chatUuid}`);
  };

  const handleExploreMore = () => {
    router.push('/welcome');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Image src='/logo.png' width={32} height={32} alt="Cloak Talk Logo" />
          </div>
          <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 relative overflow-hidden'>
      {/* Animated Background Elements - Safari Compatible */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-70 animate-blob ${
            isSafari ? 'bg-blob' : 'mix-blend-multiply filter blur-xl'
          }`}
          style={isSafari ? { filter: 'blur(50px)' } : {}}
        ></div>
        <div 
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-70 animate-blob animation-delay-2000 ${
            isSafari ? 'bg-blob' : 'mix-blend-multiply filter blur-xl'
          }`}
          style={isSafari ? { filter: 'blur(50px)' } : {}}
        ></div>
        <div 
          className={`absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-full opacity-70 animate-blob animation-delay-4000 ${
            isSafari ? 'bg-blob' : 'mix-blend-multiply filter blur-xl'
          }`}
          style={isSafari ? { filter: 'blur(50px)' } : {}}
        ></div>
      </div>

      {/* Navigation */}
      <nav className='px-4 py-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-gray-100/50 relative z-10'>
        <div className='flex justify-between items-center max-w-7xl mx-auto'>
          {/* Logo */}
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg'>
              <Image src='/logo.png' width={24} height={24} alt="Cloak Talk Logo" />
            </div>
            <div>
              <span className='text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                CloakTalk
              </span>
              <div className='text-xs text-gray-500 font-medium'>Your Campus, Anonymously</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className='flex items-center space-x-6'>
            <button 
              onClick={handleExploreMore}
              className='text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium'
            >
              Learn More
            </button>
            
            {isAuthenticated && user ? (
              <div className='flex items-center space-x-3'>
                <div className='flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2'>
                  {user.profile_picture && (
                    <Image src={user.profile_picture} width={24} height={24} alt={user.first_name} className='rounded-full' />
                  )}
                  <span className='text-sm font-medium text-gray-700'>
                    {user.first_name}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className='bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold text-sm'
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative z-10'>
        <div className='max-w-4xl mx-auto text-center space-y-8'>
          {/* Main Heading */}
          <div className='space-y-6'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]'>
              Start an
              <br />
              <span className='bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent'>
                anonymous chat
              </span>
              <br />
              with your peers
            </h1>

            {/* Rotating Tips */}
            <div className='h-16 flex items-center justify-center'>
              <p className='text-lg sm:text-xl text-gray-600 leading-relaxed transition-all duration-500 max-w-2xl'>
                {anonymousChatTips[currentTipIndex]}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <button
              onClick={handleStartAnonymousChat}
              className='group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden'
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className='relative z-10 flex items-center justify-center text-lg'>
                🚀 Start Anonymous Chat
                <svg
                  className={`ml-2 w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </span>
              <div className='absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </button>

            <button 
              onClick={handleExploreMore}
              className='px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-all duration-300 text-lg backdrop-blur-sm'
            >
              How It Works
            </button>
          </div>

          {/* Feature Cards */}
          <div className='grid md:grid-cols-3 gap-6 mt-16'>
            <div className='bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-100/50 hover:shadow-lg transition-all duration-300'>
              <div className='w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-200 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                <span className='text-2xl'>🔒</span>
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>100% Anonymous</h3>
              <p className='text-gray-600 text-sm'>Your identity stays completely private while you connect with college peers.</p>
            </div>

            <div className='bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-100/50 hover:shadow-lg transition-all duration-300'>
              <div className='w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-200 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                <span className='text-2xl'>🎓</span>
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Campus Only</h3>
              <p className='text-gray-600 text-sm'>Connect exclusively with students from your college community.</p>
            </div>

            <div className='bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-100/50 hover:shadow-lg transition-all duration-300'>
              <div className='w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-200 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                <span className='text-2xl'>⚡</span>
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>Instant Connect</h3>
              <p className='text-gray-600 text-sm'>Get matched with someone from your college instantly and start chatting.</p>
            </div>
          </div>

          {/* Status Message */}
          {!isAuthenticated && (
            <div className='mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl'>
              <p className='text-blue-700 text-sm'>
                <span className='font-semibold'>🔐 Sign in required:</span> You&apos;ll need to authenticate with your college email to start anonymous chats.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
