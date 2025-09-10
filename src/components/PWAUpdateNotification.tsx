'use client';

import { useEffect, useState } from 'react';

export default function PWAUpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker has been installed and is waiting to activate
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
            }
          });
        });

        // Check if there's a waiting service worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdatePrompt(true);
        }

      } catch (error) {
        console.log('SW registration failed: ', error);
      }
    };

    registerSW();

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        setShowUpdatePrompt(false);
        window.location.reload();
      }
    });

  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) return;

    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    setShowUpdatePrompt(false);
    
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm">Update Available</p>
          <p className="text-xs opacity-90">A new version of CloakTalk is ready!</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="text-xs text-blue-100 hover:text-white px-2 py-1"
          >
            Later
          </button>
          <button
            onClick={handleUpdate}
            className="bg-white text-blue-600 text-xs px-3 py-1 rounded hover:bg-blue-50 transition-colors font-medium"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
