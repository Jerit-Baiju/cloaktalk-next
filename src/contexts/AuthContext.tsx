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
          
          // Validate token by fetching user data
          if (await validateAndFetchUser(parsedTokenData)) {
            setTokenData(parsedTokenData);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('tokenData');
            setTokenData(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('tokenData');
        setTokenData(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  });

  // Function to validate token and fetch user data
  const validateAndFetchUser = async (tokens: TokenData): Promise<boolean> => {
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
      return false;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  // Function to refresh token and fetch user data
  const refreshTokenAndFetchUser = async (tokens: TokenData): Promise<boolean> => {
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
        return await validateAndFetchUser(newTokenData);
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
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
      const isValid = await validateAndFetchUser(tokenData);
      if (!isValid) {
        // Token is invalid, log out user
        logout();
      }
    };

    // Set up periodic validation
    const interval = setInterval(validateTokenPeriodically, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  });

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
      await validateAndFetchUser(tokenData);
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
