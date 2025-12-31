'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

// Types
export interface QueueStatus {
  waiting_count: number;
  college: string;
  college_id: number;
  is_in_queue?: boolean;
  active_chats_count?: number;
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'in_queue' | 'in_chat' | 'offline';
  last_seen?: string;
}

export interface QueueWebSocketContextType {
  // Queue status
  queueStatus: QueueStatus | null;
  isInQueue: boolean;
  isConnected: boolean;
  
  // User presence
  onlineUsers: UserPresence[];
  
  // Queue actions
  joinQueue: () => void;
  leaveQueue: () => void;
  refreshStatus: () => void;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
}

const QueueWebSocketContext = createContext<QueueWebSocketContextType | undefined>(undefined);

interface QueueWebSocketProviderProps {
  children: React.ReactNode;
}

export const QueueWebSocketProvider: React.FC<QueueWebSocketProviderProps> = ({ children }) => {
  const { user, tokenData } = useAuth();
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<(() => void) | null>(null);

  // Get WebSocket URL with token
  const getWsUrl = useCallback(() => {
    const baseWsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000';
    const token = tokenData?.access;
    const url = `${baseWsUrl}/ws/queue/`;
    
    // Add token as query parameter if available
    if (token) {
      return `${url}?token=${token}`;
    }
    
    return url;
  }, [tokenData?.access]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Send heartbeat to maintain connection
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'heartbeat' }));
    }
  }, []);

  // Connect to queue WebSocket
  const connect = useCallback(() => {
    if (!user || !tokenData || wsRef.current) return;

    console.log('Connecting to queue WebSocket...');
    const wsUrl = getWsUrl();
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Queue WebSocket connected');
      setIsConnected(true);
      
      // Send initial status check
      ws.send(JSON.stringify({ action: 'check_status' }));
      
      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // Every 30 seconds
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'queue_status':
          console.log('Queue status update:', data);
          setQueueStatus(data);
          if (typeof data.is_in_queue === 'boolean') {
            setIsInQueue(data.is_in_queue);
          }
          break;

        case 'user_presence_update':
          console.log('User presence update:', data);
          if (data.users) {
            setOnlineUsers(data.users);
          }
          break;

        case 'chat_matched':
          console.log('Chat matched:', data);
          setIsInQueue(false);
          
          // Notify parent components about chat match
          window.dispatchEvent(new CustomEvent('chatMatched', { 
            detail: { chatId: data.chat_id } 
          }));
          break;

        case 'user_joined_queue':
          console.log('User joined queue:', data);
          // Update queue status if provided in the response
          if (data.waiting_count !== undefined) {
            setQueueStatus(prev => prev ? {
              ...prev,
              waiting_count: data.waiting_count
            } : null);
          }
          break;

        case 'user_left_queue':
          console.log('User left queue:', data);
          // Update state immediately without additional check_status call
          setIsInQueue(false);
          // Update queue status if provided in the response
          if (data.waiting_count !== undefined) {
            setQueueStatus(prev => prev ? {
              ...prev,
              waiting_count: data.waiting_count,
              is_in_queue: false
            } : null);
          }
          break;

        case 'error':
          console.error('Queue WebSocket error:', data.message);
          
          // Handle expected errors gracefully
          if (data.message === 'Already in queue') {
            setIsInQueue(true);
            // Request fresh status
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ action: 'check_status' }));
            }
          } else if (data.message === 'Not in queue') {
            setIsInQueue(false);
          }
          break;

        case 'pong':
          // Heartbeat response - connection is alive
          break;

        default:
          console.log('Queue message:', data);
      }
    };

    ws.onerror = (error) => {
      console.error('Queue WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('Queue WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setQueueStatus(null);
      setOnlineUsers([]);
      clearTimers();
      wsRef.current = null;
      
      // Attempt to reconnect if user is still authenticated and it wasn't a manual close
      if (user && tokenData && event.code !== 1000 && connectRef.current) {
        console.log('Attempting to reconnect in 3 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
          if (connectRef.current) connectRef.current();
        }, 3000);
      }
    };

    wsRef.current = ws;
  }, [user, tokenData, getWsUrl, sendHeartbeat, clearTimers]);

  // Keep connectRef updated with the current connect function
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('Disconnecting from queue WebSocket...');
    clearTimers();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setQueueStatus(null);
    setIsInQueue(false);
    setOnlineUsers([]);
  }, [clearTimers]);

  // Queue actions
  const joinQueue = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Joining queue...');
      wsRef.current.send(JSON.stringify({ action: 'join_queue' }));
    }
  }, []);

  const leaveQueue = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Leaving queue...');
      // Optimistic update for instant UI feedback
      setIsInQueue(false);
      wsRef.current.send(JSON.stringify({ action: 'leave_queue' }));
    }
  }, []);

  const refreshStatus = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Refreshing queue status...');
      wsRef.current.send(JSON.stringify({ action: 'check_status' }));
    }
  }, []);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (user && tokenData) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [user, tokenData]); // Removed connect and disconnect to prevent infinite loop

  // Listen for window focus to refresh status  
  useEffect(() => {
    const handleFocus = () => {
      if (isConnected) {
        refreshStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isConnected]); // Removed refreshStatus to prevent potential issues

  const value: QueueWebSocketContextType = {
    queueStatus,
    isInQueue,
    isConnected,
    onlineUsers,
    joinQueue,
    leaveQueue,
    refreshStatus,
    connect,
    disconnect,
  };

  return (
    <QueueWebSocketContext.Provider value={value}>
      {children}
    </QueueWebSocketContext.Provider>
  );
};

export const useQueueWebSocket = (): QueueWebSocketContextType => {
  const context = useContext(QueueWebSocketContext);
  if (context === undefined) {
    throw new Error('useQueueWebSocket must be used within a QueueWebSocketProvider');
  }
  return context;
};
