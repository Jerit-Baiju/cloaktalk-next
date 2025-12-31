'use client';

import { useAxios } from '@/lib/useAxios';
import { AuthContextType, LoginResponse, TokenData, User } from '@/types/auth';
import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { post } = useAxios();

  // Initialize auth state from localStorage and validate tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedTokenData = localStorage.getItem('tokenData');

        if (storedTokenData) {
          const parsedTokenData: TokenData = JSON.parse(storedTokenData);
          
          // Always set the token data first (optimistic)
          setTokenData(parsedTokenData);
          
          // Validate token by fetching user data
          const validationResult = await validateAndFetchUser(parsedTokenData);
          
          if (validationResult === false) {
            // Token is definitively invalid (401 response), clear it
            localStorage.removeItem('tokenData');
            setTokenData(null);
            setUser(null);
          }
          // If null (network error), keep the tokens and user will be logged in
          // The validation will be retried when the backend comes back online
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Only clear if data is corrupted (JSON parse error)
        localStorage.removeItem('tokenData');
        setTokenData(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Function to validate token and fetch user data
  // Returns: true = valid token, false = invalid/expired token, null = network error (keep token)
  const validateAndFetchUser = async (tokens: TokenData): Promise<boolean | null> => {
    try {
      // Temporarily set tokens to make authenticated request
      const tempResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/user/`, {
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (tempResponse.ok) {
        const userData = await tempResponse.json();
        setUser(userData);
        return true;
      } else if (tempResponse.status === 401) {
        // Token might be expired, try to refresh
        return await refreshTokenAndFetchUser(tokens);
      }
      // Other error statuses (500, etc.) - keep the token, just log the error
      console.warn('Server returned non-401 error:', tempResponse.status);
      return null;
    } catch (error) {
      // Network error (backend offline, no internet, etc.) - keep the token
      console.warn('Network error during token validation (backend may be offline):', error);
      return null;
    }
  };

  // Function to refresh token and fetch user data
  // Returns: true = refreshed successfully, false = refresh failed (expired), null = network error
  const refreshTokenAndFetchUser = async (tokens: TokenData): Promise<boolean | null> => {
    try {
      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const newTokenData: TokenData = {
          access: refreshData.access,
          refresh: tokens.refresh, // Keep the same refresh token
        };

        // Update localStorage and state
        localStorage.setItem('tokenData', JSON.stringify(newTokenData));
        setTokenData(newTokenData);

        // Fetch user data with new token
        const userFetchResult = await validateAndFetchUser(newTokenData);
        // If user fetch returns null (network error), we still refreshed the token successfully
        return userFetchResult === null ? true : userFetchResult;
      } else if (refreshResponse.status === 401) {
        // Refresh token is expired or invalid
        return false;
      }
      // Other server errors - keep tokens
      return null;
    } catch (error) {
      // Network error - keep tokens
      console.warn('Network error during token refresh (backend may be offline):', error);
      return null;
    }
  };

  // Protected routes logic
  useEffect(() => {
    if (loading) return;

    const path = window.location.pathname;
    const publicPaths = ['/login', '/welcome', '/privacy-policy', '/terms-and-conditions', '/community/invite'];
    const isCallbackPath = path.startsWith('/api/auth/callback');
    const isPublicPath = publicPaths.includes(path) || isCallbackPath;

    // Redirect logic
    if (!tokenData && !isPublicPath) {
      router.replace('/welcome');
    } else if (tokenData && path === '/login') {
      router.replace('/');
    }
  }, [router, tokenData, loading]);

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!tokenData) return;

    const validateTokenPeriodically = async () => {
      const validationResult = await validateAndFetchUser(tokenData);
      // Only logout if token is definitively invalid (false), not on network errors (null)
      if (validationResult === false) {
        console.log('Token expired, logging out user');
        logout();
      }
      // If null (network error), keep user logged in and retry next time
    };

    // Set up periodic validation
    const interval = setInterval(validateTokenPeriodically, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [tokenData]);

  // Login with Google authorization code
  const login = async (code: string): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await post<LoginResponse>('/auth/google/login/', {
        code,
      });

      if (response.data) {
        const { access, refresh, user: userData } = response.data;
        
        const newTokenData: TokenData = { access, refresh };
        
        // Store only tokens in localStorage
        localStorage.setItem('tokenData', JSON.stringify(newTokenData));
        
        // Update state with both tokens and user data
        setTokenData(newTokenData);
        setUser(userData);
        
        // Redirect to home page
        router.replace('/');
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    // Clear only tokens from localStorage
    localStorage.removeItem('tokenData');
    
    // Clear state
    setTokenData(null);
    setUser(null);
    
    // Redirect to welcome page instead of login
    router.replace('/welcome');
  };

  // Function to refresh user data (useful for profile updates)
  const refreshUser = async (): Promise<void> => {
    if (!tokenData) return;
    
    try {
      const validationResult = await validateAndFetchUser(tokenData);
      // Only logout on definitive token expiration, not network errors
      if (validationResult === false) {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Computed property to check if user is authenticated
  const isAuthenticated = Boolean(tokenData && user);

  const contextValue: AuthContextType = {
    user,
    tokenData,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
