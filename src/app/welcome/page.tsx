'use client'
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

const page = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { user, logout, loading, isAuthenticated } = useAuth();

    const messages = [
        "Connect anonymously with your campus community",
        "Share thoughts safely in your college space",
        "Build meaningful connections across departments",
        "Express yourself freely in a secure environment"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

  return (
    <div className='max-sm:min-h-screen md:h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50 relative'>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className='h-full flex flex-col relative z-10'>
        {/* Navigation */}
        <nav className='px-4 py-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-gray-100/50'>
          <div className='flex justify-between items-center max-w-7xl mx-auto'>
            {/* Logo */}
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg'>
                <img src='/logo.png' className='w-6 h-6' alt="Cloak Talk Logo" />
              </div>
              <div>
                <span className='text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                  CloakTalk
                </span>
                <div className='text-xs text-gray-500 font-medium'>Your Campus, Anonymously</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden lg:flex items-center space-x-8'>
              <a href='#features' className='text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium'>
                Features
              </a>
              <a href='#safety' className='text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium'>
                Safety
              </a>
              <a href='#community' className='text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium'>
                Community
              </a>

              {!loading && (isAuthenticated && user ? (
                <div className='flex items-center space-x-3'>
                  <div className='flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2'>
                    {user.profile_picture && <img src={user.profile_picture} alt={user.first_name} className='w-6 h-6 rounded-full' />}
                    <span className='text-sm font-medium text-gray-700'>
                      {user.first_name}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium text-sm'>
                    Sign Out
                  </button>
                </div>
              ) : (
                <a
                  href='/login'
                  className='bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold text-sm'>
                  Get Started
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className='lg:hidden p-2 text-gray-600 hover:text-pink-600 transition-colors'
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className='lg:hidden mt-4 pb-4 space-y-3 border-t border-gray-100 pt-4'>
              <a href='#features' className='block text-gray-600 hover:text-pink-600 transition-colors font-medium'>Features</a>
              <a href='#safety' className='block text-gray-600 hover:text-pink-600 transition-colors font-medium'>Safety</a>
              <a href='#community' className='block text-gray-600 hover:text-pink-600 transition-colors font-medium'>Community</a>
              {!loading && !isAuthenticated && (
                <a href='/login' className='block bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-xl text-center font-semibold'>
                  Get Started
                </a>
              )}
            </div>
          )}
        </nav>

        {/* Hero Section - Full Height */}
        <main className='flex-1 flex items-center px-4 sm:px-6 lg:px-8 py-8'>
          <div className='max-w-7xl mx-auto w-full'>
            <div className='grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-120px)]'>
              
              {/* Left Content */}
              <div className='lg:col-span-7 space-y-8'>
                {/* Badge */}
                <div className='inline-flex items-center bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold border border-pink-200'>
                  <span className='mr-2'>🎓</span>
                  Built exclusively for college students
                </div>

                {/* Main Heading */}
                <div className='space-y-6'>
                  <h1 className='text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1]'>
                    Your campus,
                    <br />
                    <span className='bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent'>
                      anonymously
                    </span>
                    <br />
                    connected
                  </h1>

                  {/* Rotating Messages */}
                  <div className='h-16 flex items-center'>
                    <p className='text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed transition-all duration-500'>
                      {messages[currentMessageIndex]}
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className='flex flex-col sm:flex-row gap-4'>
                  <a
                    href='/login'
                    className='group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-center overflow-hidden'
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                    <span className='relative z-10 flex items-center justify-center text-lg'>
                      Start Connecting
                      <svg
                        className={`ml-2 w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                      </svg>
                    </span>
                    <div className='absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  </a>

                  <button className='px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-all duration-300 text-lg backdrop-blur-sm'>
                    Learn More
                  </button>
                </div>

                {/* Stats */}
                <div className='grid grid-cols-3 gap-6 pt-8 border-t border-gray-100'>
                  <div className='text-center lg:text-left'>
                    <div className='text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent'>25K+</div>
                    <div className='text-sm text-gray-600 font-medium'>Active Students</div>
                  </div>
                  <div className='text-center lg:text-left'>
                    <div className='text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent'>500+</div>
                    <div className='text-sm text-gray-600 font-medium'>College Campuses</div>
                  </div>
                  <div className='text-center lg:text-left'>
                    <div className='text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent'>99.9%</div>
                    <div className='text-sm text-gray-600 font-medium'>Privacy Rate</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Phone Mockup */}
              <div className='lg:col-span-5 flex justify-center lg:justify-end'>
                <div className='relative'>
                  {/* Floating Elements */}
                  <div className='absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-yellow-300 to-pink-300 rounded-2xl rotate-12 opacity-80 animate-float'></div>
                  <div className='absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-70 animate-float animation-delay-2000'></div>
                  <div className='absolute top-1/3 -left-12 w-8 h-8 bg-gradient-to-br from-blue-300 to-pink-300 rounded-lg rotate-45 opacity-60 animate-float animation-delay-4000'></div>

                  {/* Phone Mockup */}
                  <div className='relative z-10 bg-gray-900 rounded-[2.5rem] p-2 w-80 h-[700px] shadow-2xl'>
                    <div className='bg-white rounded-[2rem] h-full overflow-hidden relative'>
                      {/* Phone Header */}
                      <div className='bg-gradient-to-r from-pink-500 to-rose-600 p-4 relative'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                              <img src='/beanhead.svg' alt='Avatar' className='w-6 h-6' />
                            </div>
                            <div>
                              <div className='font-semibold text-white'>Anonymous Buddy</div>
                              <div className='text-xs text-pink-100 flex items-center'>
                                <div className='w-2 h-2 bg-green-400 rounded-full mr-1'></div>
                                online now
                              </div>
                            </div>
                          </div>
                          <button className='w-8 h-8 rounded-full bg-white/20 flex items-center justify-center'>
                            <span className='text-white text-lg'>⋮</span>
                          </button>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className='p-4 space-y-4 h-[calc(100%-80px)] bg-gradient-to-b from-gray-50 to-white overflow-hidden'>
                        {/* Incoming Message */}
                        <div className='flex justify-start'>
                          <div className='bg-white p-4 rounded-2xl rounded-tl-lg shadow-sm max-w-[240px] border border-gray-100'>
                            <p className='text-sm text-gray-800'>
                              Hey! I'm in the same major as you. Want to study together for the midterm? 📚
                            </p>
                            <p className='text-xs text-gray-500 mt-2'>StudyBuddy • 5m ago</p>
                          </div>
                        </div>

                        {/* Outgoing Message */}
                        <div className='flex justify-end'>
                          <div className='bg-gradient-to-r from-pink-500 to-rose-600 p-4 rounded-2xl rounded-tr-lg shadow-sm max-w-[240px]'>
                            <p className='text-sm text-white'>
                              Absolutely! This anonymous feature makes it so much easier to reach out. Library at 3pm? ✨
                            </p>
                            <p className='text-xs text-pink-100 mt-2'>You • 2m ago</p>
                          </div>
                        </div>

                        {/* Incoming Message */}
                        <div className='flex justify-start'>
                          <div className='bg-white p-4 rounded-2xl rounded-tl-lg shadow-sm max-w-[240px] border border-gray-100'>
                            <p className='text-sm text-gray-800'>
                              Perfect! I love how safe this app feels for making new connections 🛡️
                            </p>
                            <p className='text-xs text-gray-500 mt-2'>StudyBuddy • just now</p>
                          </div>
                        </div>

                        {/* Typing Indicator */}
                        <div className='flex justify-start'>
                          <div className='bg-gray-100 p-3 rounded-2xl rounded-tl-lg'>
                            <div className='flex space-x-1'>
                              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-150'></div>
                              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-300'></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default page