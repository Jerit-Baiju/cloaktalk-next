'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function QueueComponent() {
  const { user } = useAuth();
  const { 
    queueStatus, 
    isInQueue, 
    joinQueue, 
    leaveQueue, 
    currentChat, 
    isQueueConnected 
  } = useWebSocket();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  // Redirect to chat if user has an active chat
  useEffect(() => {
    if (currentChat) {
      router.push(`/chat/${currentChat.chat_id}`);
    }
  }, [currentChat, router]);

  const handleJoinQueue = async () => {
    setIsJoining(true);
    joinQueue();
    // The isJoining state will be reset when we get the queue status update
  };

  const handleLeaveQueue = () => {
    leaveQueue();
    setIsJoining(false);
  };

  // Reset joining state when queue status changes
  useEffect(() => {
    if (queueStatus && isJoining) {
      setIsJoining(false);
    }
  }, [queueStatus, isJoining]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the queue.</p>
        </div>
      </div>
    );
  }

  if (!user.college) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No College Assigned</h3>
          <p className="text-gray-600">You need to be assigned to a college to join the queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Anonymous Chat Queue
            </h1>
            <p className="text-gray-600">
              Connect with peers from {user.college.name} anonymously
            </p>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isQueueConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isQueueConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {isQueueConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {/* Queue Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-2-4h4m-4 0l-3-3m3 3l-3 3M9 1H3a2 2 0 00-2 2v6a2 2 0 002 2h6m1-3H4m5 0l-3-3m3 3l-3 3" />
                  </svg>
                </div>
                
                {queueStatus ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {queueStatus.college}
                    </h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {queueStatus.waiting_count}
                    </p>
                    <p className="text-gray-600">
                      {queueStatus.waiting_count === 1 ? 'person' : 'people'} waiting in queue
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Loading queue status...
                    </h3>
                    <div className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded mb-2 mx-auto w-16"></div>
                      <div className="h-4 bg-gray-200 rounded mx-auto w-32"></div>
                    </div>
                  </>
                )}
              </div>

              {/* Queue Actions */}
              <div className="space-y-4">
                {!isInQueue ? (
                  <button
                    onClick={handleJoinQueue}
                    disabled={isJoining || !isQueueConnected}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    {isJoining ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining Queue...
                      </>
                    ) : (
                      'Join Queue'
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-yellow-800 font-medium">
                          You&apos;re in the queue! Waiting for a match...
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLeaveQueue}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                      Leave Queue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">How it works</h4>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <p>Join the queue and wait to be matched with another student from your college</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <p>Once matched, you&apos;ll be redirected to a private anonymous chat</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <p>Chat safely and anonymously with your peer. End the chat anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
