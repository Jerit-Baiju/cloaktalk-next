'use client';

import { useAxios } from '@/lib/useAxios';
import { AccessCheckResponse, CollegeStatusResponse } from '@/types/auth';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AccessControlContextType {
  canAccess: boolean;
  accessData: AccessCheckResponse | null;
  collegeStatus: CollegeStatusResponse | null;
  loading: boolean;
  checkAccess: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

interface AccessControlProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
  tokenData: { access: string; refresh: string } | null;
}

export const AccessControlProvider: React.FC<AccessControlProviderProps> = ({ 
  children, 
  isAuthenticated, 
  tokenData 
}) => {
  const [canAccess, setCanAccess] = useState(false);
  const [accessData, setAccessData] = useState<AccessCheckResponse | null>(null);
  const [collegeStatus, setCollegeStatus] = useState<CollegeStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { get } = useAxios();

  // Function to check access permissions
  const checkAccess = useCallback(async () => {
    if (!isAuthenticated || !tokenData) {
      setCanAccess(false);
      setAccessData(null);
      return;
    }

    try {
      setLoading(true);
      
      // Explicitly pass the Authorization header to ensure it's included
      const headers = {
        'Authorization': `Bearer ${tokenData.access}`,
        'Content-Type': 'application/json',
      };
      
      const response = await get<AccessCheckResponse>('/api/college/access/', { headers });
      
      if (response.data) {
        setCanAccess(response.data.can_access);
        setAccessData(response.data);
      } else {
        // API returned an error response (403 or other)
        // Check if we have structured error data
        if (response.errorData && typeof response.errorData === 'object') {
          const errorResponse = response.errorData as AccessCheckResponse;
          setCanAccess(false);
          setAccessData(errorResponse);
        } else {
          setCanAccess(false);
          setAccessData({
            can_access: false,
            reason: 'unknown_error',
            message: response.error || 'Access denied'
          });
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setCanAccess(false);
      setAccessData({
        can_access: false,
        reason: 'network_error',
        message: 'Unable to verify access permissions'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, tokenData, get]);

  // Function to get college status
  const refreshStatus = useCallback(async () => {
    if (!isAuthenticated || !tokenData) {
      setCollegeStatus(null);
      return;
    }

    try {
      // Explicitly pass the Authorization header to ensure it's included
      const headers = {
        'Authorization': `Bearer ${tokenData.access}`,
        'Content-Type': 'application/json',
      };
      
      const response = await get<CollegeStatusResponse>('/college/status/', { headers });
      if (response.data) {
        setCollegeStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching college status:', error);
    }
  }, [isAuthenticated, tokenData, get]);

  // Initial check when authentication state changes
  useEffect(() => {
    if (isAuthenticated && tokenData) {
      checkAccess();
      refreshStatus();
    } else {
      setCanAccess(false);
      setAccessData(null);
      setCollegeStatus(null);
    }
  }, [isAuthenticated, tokenData, checkAccess, refreshStatus]);

  // Set up periodic access checks (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated || !tokenData) return;

    const interval = setInterval(() => {
      checkAccess();
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, tokenData, checkAccess]);

  // Set up more frequent checks when near window boundaries (every 5 seconds)
  useEffect(() => {
    if (!accessData?.time_remaining_seconds) return;
    
    // If less than 2 minutes remaining, check more frequently
    if (accessData.time_remaining_seconds < 120) {
      const interval = setInterval(() => {
        checkAccess();
      }, 5 * 1000); // 5 seconds

      return () => clearInterval(interval);
    }
  }, [accessData?.time_remaining_seconds, checkAccess]);

  const contextValue: AccessControlContextType = {
    canAccess,
    accessData,
    collegeStatus,
    loading,
    checkAccess,
    refreshStatus,
  };

  return (
    <AccessControlContext.Provider value={contextValue}>
      {children}
    </AccessControlContext.Provider>
  );
};

// Custom hook to use the access control context
export const useAccessControl = (): AccessControlContextType => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};
