'use client';

import Image from 'next/image';

export default function Offline() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <Image
          src="/icon-192x192.png"
          alt="CloakTalk"
          width={96}
          height={96}
          className="mx-auto mb-8"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">You&apos;re offline</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Check your internet connection and try again. Your messages will sync when you&apos;re back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
