import { ApiResponse, TokenData } from '@/types/auth';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

// Create axios instance
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const tokenData = localStorage.getItem('tokenData');
        if (tokenData) {
          const parsed: TokenData = JSON.parse(tokenData);
          config.headers.Authorization = `Bearer ${parsed.access}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (typeof window !== 'undefined') {
          const tokenData = localStorage.getItem('tokenData');
          if (tokenData) {
            const parsed: TokenData = JSON.parse(tokenData);
            
            try {
              // Try to refresh token
              const refreshResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token/refresh/`,
                { refresh: parsed.refresh }
              );

              const newTokenData: TokenData = {
                access: refreshResponse.data.access,
                refresh: parsed.refresh, // Keep the same refresh token
              };

              localStorage.setItem('tokenData', JSON.stringify(newTokenData));
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newTokenData.access}`;
              return instance(originalRequest);
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to welcome
              localStorage.removeItem('tokenData');
              localStorage.removeItem('user');
              window.location.href = '/welcome';
              return Promise.reject(refreshError);
            }
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create the axios instance
const apiClient = createAxiosInstance();

// Custom hook for making API requests
export const useAxios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async <T>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response: AxiosResponse<T> = await apiClient(config);
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (err: unknown) {
      let errorMessage = 'An error occurred';
      let statusCode = 500;
      let errorData: unknown = null;
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { 
            data?: unknown; 
            status?: number 
          }; 
          message?: string 
        };
        
        statusCode = axiosError.response?.status || 500;
        errorData = axiosError.response?.data;
        
        // Try to get error message from various possible fields
        if (errorData && typeof errorData === 'object') {
          const responseData = errorData as Record<string, unknown>;
          errorMessage = (responseData.detail as string) || 
                        (responseData.message as string) || 
                        (responseData.error as string) || 
                        axiosError.message || 
                        'An error occurred';
        } else {
          errorMessage = axiosError.message || 'An error occurred';
        }
      }
      
      setError(errorMessage);
      
      return {
        error: errorMessage,
        status: statusCode,
        errorData: errorData, // Include the full error response data
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request<T>({ method: 'GET', url, ...config });
  }, [request]);

  const post = useCallback(async <T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return request<T>({ method: 'POST', url, data, ...config });
  }, [request]);

  const put = useCallback(async <T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return request<T>({ method: 'PUT', url, data, ...config });
  }, [request]);

  const del = useCallback(async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request<T>({ method: 'DELETE', url, ...config });
  }, [request]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    request,
  };
};

// Export the axios instance for direct use if needed
export { apiClient };
