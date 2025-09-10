'use client';

import { useAccessControl } from '@/contexts/AccessControlContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { canAccess, loading: accessLoading } = useAccessControl();
  const router = useRouter();

  useEffect(() => {
    if (loading || accessLoading) return;

    if (!isAuthenticated) {
      router.replace('/welcome');
      return;
    }

    if (isAuthenticated && canAccess) {
      router.replace('/queue');
      return;
    }

    // If authenticated but cannot access, show access control message
    // This will be handled by AccessControlWrapper
  }, [isAuthenticated, canAccess, loading, accessLoading, router]);

  // Show loading state while checking authentication and access
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading CloakTalk</h2>
        <p className="text-gray-600">Checking your access...</p>
      </div>
    </div>
  );
}
