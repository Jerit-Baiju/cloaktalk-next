'use client';

import { useState } from 'react';

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50'>
      {/* Navigation */}
      <nav className='px-4 py-3 sm:px-6 sm:py-4 md:px-12'>
        <div className='flex justify-between items-center max-w-6xl mx-auto'>
          <div className='flex items-center space-x-2'>
            <div className='w-12 h-12 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center'>
              <img src='/logo.png' />
            </div>
            <span className='text-xl sm:text-2xl font-bold text-gray-900'>Cloak Talk</span>
          </div>

          <div className='hidden md:flex items-center space-x-8'>
            <a href='#features' className='text-gray-600 hover:text-pink-500 transition-colors'>
              Features
            </a>
            <a href='#about' className='text-gray-600 hover:text-pink-500 transition-colors'>
              About
            </a>
            <a href='#contact' className='text-gray-600 hover:text-pink-500 transition-colors'>
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className='px-4 py-8 sm:px-6 sm:py-12 md:px-12'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
            {/* Left Content */}
            <div className='space-y-6 sm:space-y-8 order-2 lg:order-1'>
              <div className='space-y-4'>
                <div className='inline-flex items-center bg-pink-100 text-pink-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium'>
                  🎓 Built for Students
                </div>

                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight'>
                  The anonymous side of your
                  <span className='bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent'> campus</span>
                </h1>

                <p className='text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed'>
                  Cloak provides secure, private messaging within your college. Share thoughts, collaborate on projects, and build
                  meaningful connections with peers across your campus in a safe environment.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                <button
                  className='group relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}>
                  <span className='relative z-10 flex items-center justify-center text-sm sm:text-base'>
                    Get Started
                    <svg
                      className={`ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                    </svg>
                  </span>
                  <div className='absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                </button>

                <button className='px-6 py-3 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-pink-500 hover:text-pink-500 transition-all duration-300 text-sm sm:text-base'>
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className='flex items-center justify-between sm:justify-start sm:space-x-8 pt-6 sm:pt-8'>
                <div className='text-center'>
                  <div className='text-xl sm:text-2xl font-bold text-gray-900'>10K+</div>
                  <div className='text-xs sm:text-sm text-gray-600'>Active Students</div>
                </div>
                <div className='text-center'>
                  <div className='text-xl sm:text-2xl font-bold text-gray-900'>500+</div>
                  <div className='text-xs sm:text-sm text-gray-600'>Colleges</div>
                </div>
                <div className='text-center'>
                  <div className='text-xl sm:text-2xl font-bold text-gray-900'>99.9%</div>
                  <div className='text-xs sm:text-sm text-gray-600'>Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className='relative order-1 lg:order-2 flex justify-center'>
              <div className='relative z-10'>
                {/* Phone Mockup */}
                <div className='bg-gray-900 rounded-[2rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 w-64 h-[520px] sm:w-72 sm:h-[600px] shadow-2xl'>
                  <div className='bg-white rounded-[1.5rem] sm:rounded-[2rem] h-full overflow-hidden'>
                    {/* Phone Header */}
                    <div className='bg-gradient-to-r from-pink-500 to-pink-600 p-3 sm:p-4 text-white'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2 sm:space-x-3'>
                          <div className='w-12 h-12 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center'>
                            <img src='/beanhead.svg' alt='Logo' className='w-full' />
                          </div>
                          <div>
                            <div className='font-semibold text-sm sm:text-base'>Lyra Gloomveil</div>
                            <div className='text-xs opacity-75'>• online now</div>
                          </div>
                        </div>
                        <div className='w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center'>
                          <span className='text-white text-xs'>⋮</span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className='p-3 sm:p-4 space-y-3 sm:space-y-4 h-full bg-gray-50'>
                      <div className='flex justify-start'>
                        <div className='bg-white p-2.5 sm:p-3 rounded-2xl rounded-tl-md shadow-sm max-w-[200px] sm:max-w-xs'>
                          <p className='text-xs sm:text-sm text-gray-800'>
                            Hey there! What's your major? I'm studying computer science 💻
                          </p>
                          <p className='text-[10px] sm:text-xs text-gray-500 mt-1'>PurpleButterfly • 2m ago</p>
                        </div>
                      </div>

                      <div className='flex justify-end'>
                        <div className='bg-gradient-to-r from-pink-500 to-pink-600 p-2.5 sm:p-3 rounded-2xl rounded-tr-md shadow-sm max-w-[200px] sm:max-w-xs'>
                          <p className='text-xs sm:text-sm text-white'>
                            Cool! I'm in psychology. Love connecting with fellow students across campus 🎓
                          </p>
                          <p className='text-[10px] sm:text-xs text-pink-100 mt-1'>You • 1m ago</p>
                        </div>
                      </div>

                      <div className='flex justify-start'>
                        <div className='bg-white p-2.5 sm:p-3 rounded-2xl rounded-tl-md shadow-sm max-w-[200px] sm:max-w-xs'>
                          <p className='text-xs sm:text-sm text-gray-800'>
                            That's awesome! This anonymous chat feels so safe for making new connections 🌟
                          </p>
                          <p className='text-[10px] sm:text-xs text-gray-500 mt-1'>PurpleButterfly • now</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements - Hidden on mobile for cleaner look */}
              <div className='hidden sm:block absolute -top-4 -left-4 w-16 h-16 lg:w-20 lg:h-20 bg-pink-200 rounded-full animate-float opacity-60'></div>
              <div
                className='hidden sm:block absolute -bottom-8 -right-8 w-24 h-24 lg:w-32 lg:h-32 bg-pink-100 rounded-full animate-float opacity-40'
                style={{ animationDelay: '2s' }}></div>
              <div className='hidden sm:block absolute top-1/2 -left-8 w-12 h-12 lg:w-16 lg:h-16 bg-pink-300 rounded-full animate-pulse-slow opacity-50'></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id='features' className='px-4 py-16 sm:px-6 sm:py-20 md:px-12 bg-white'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12 sm:mb-16'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4'>
              Why College Students Love
              <span className='bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent'> Cloak</span>
            </h2>
            <p className='text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto'>
              Designed specifically for college environments with features that prioritize safety, privacy, and meaningful connections
              across campus.
            </p>
          </div>

          <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8'>
            {/* Feature 1 */}
            <div className='text-center p-4 sm:p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                <svg className='w-6 h-6 sm:w-8 sm:h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>Secure & Private</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                End-to-end encryption ensures your conversations stay between you and your fellow college community members.
              </p>
            </div>

            {/* Feature 2 */}
            <div className='text-center p-4 sm:p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                <svg className='w-6 h-6 sm:w-8 sm:h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>College-Based</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Connect only with verified members of your college community - students, faculty, and staff.
              </p>
            </div>

            {/* Feature 3 */}
            <div className='text-center p-4 sm:p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300 sm:col-span-2 md:col-span-1'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                <svg className='w-6 h-6 sm:w-8 sm:h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>Emotionally Safe</h3>
              <p className='text-sm sm:text-base text-gray-600'>
                Built with mental health in mind, featuring supportive communication tools and moderation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='px-4 py-8 sm:px-6 sm:py-12 md:px-12 bg-gray-900 text-white'>
        <div className='max-w-6xl mx-auto text-center'>
          <div className='flex items-center justify-center space-x-2 mb-4 sm:mb-6'>
            <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center'>
              <img src='/logo.png' />
            </div>
            <span className='text-xl sm:text-2xl font-bold'>Cloak Talk</span>
          </div>
          <p className='text-sm sm:text-base text-gray-400 mb-6 sm:mb-8'>
            Connecting college communities safely and securely across campus.
          </p>
          <div className='flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-gray-400'>
            <a href='#' className='hover:text-pink-400 transition-colors'>
              Privacy Policy
            </a>
            <a href='#' className='hover:text-pink-400 transition-colors'>
              Terms of Service
            </a>
            <a href='#' className='hover:text-pink-400 transition-colors'>
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
