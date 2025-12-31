'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

// ==================== Types ====================

export interface ChatMessage {
  id: string;
  content: string;
  sender_id?: string;
  message_type: 'text' | 'system';
  timestamp: string;
  is_own: boolean;
}

export interface Chat {
  chat_id: string;
  college: string;
  created_at: string;
  is_active: boolean;
  messages: ChatMessage[];
}

export interface AccessData {
  can_access: boolean;
  reason?: string;
  message?: string;
  college_name?: string;
  window_start?: string;
  window_end?: string;
  time_remaining_seconds?: number;
  is_service_account?: boolean;
}

export interface ActivityData {
  college: string;
  college_id?: number;
  active_chats: number;
  waiting_count: number;
  registered_students: number;
}

export interface QueueData {
  is_in_queue: boolean;
}

export interface InitialState {
  user: {
    id: string;
    is_service_account: boolean;
  };
  access: AccessData;
  activity: ActivityData;
  queue: QueueData;
  chat: Chat | null;
}

// ==================== Context Type ====================

export interface MainWebSocketContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;

  // User state from server
  access: AccessData | null;
  activity: ActivityData | null;

  // Queue state
  isInQueue: boolean;
  joinQueue: () => void;
  leaveQueue: () => void;

  // Chat state
  currentChat: Chat | null;
  joinChat: (chatId: string) => void;
  leaveChat: () => void;
  sendMessage: (content: string) => void;
  endChat: () => void;

  // Typing
  otherUserTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;

  // Utility
  refresh: () => void;
}

const MainWebSocketContext = createContext<MainWebSocketContextType | undefined>(undefined);

// ==================== Provider ====================

interface MainWebSocketProviderProps {
  children: React.ReactNode;
}

export const MainWebSocketProvider: React.FC<MainWebSocketProviderProps> = ({ children }) => {
  const { user, tokenData, isAuthenticated } = useAuth();

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Server-driven state
  const [access, setAccess] = useState<AccessData | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Get WebSocket URL
  const getWsUrl = useCallback(() => {
    const baseWsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000';
    const token = tokenData?.access;
    if (!token) return null;
    return `${baseWsUrl}/ws/main/?token=${token}`;
  }, [tokenData?.access]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  // Send heartbeat
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'heartbeat' }));
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current || isConnecting || !isAuthenticated) return;

    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    setIsConnecting(true);
    console.log('Connecting to main WebSocket...');

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Main WebSocket connected');
      setIsConnected(true);
      setIsConnecting(false);

      // Start heartbeat every 30 seconds
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('Main WebSocket error:', error);
      setIsConnecting(false);
    };

    ws.onclose = (event) => {
      console.log('Main WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setIsConnecting(false);
      clearTimers();
      wsRef.current = null;

      // Auto-reconnect if not a clean close and user is still authenticated
      if (event.code !== 1000 && isAuthenticated && tokenData) {
        console.log('Scheduling reconnect in 3 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    wsRef.current = ws;
  }, [isConnecting, isAuthenticated, getWsUrl, sendHeartbeat, clearTimers, tokenData]);

  // Handle incoming messages
  const handleMessage = useCallback((data: Record<string, unknown>) => {
    const type = data.type as string;

    switch (type) {
      case 'initial_state': {
        const state = data as unknown as InitialState;
        setAccess(state.access);
        setActivity(state.activity);
        setIsInQueue(state.queue.is_in_queue);
        setCurrentChat(state.chat);
        break;
      }

      case 'queue_joined':
        setIsInQueue(true);
        break;

      case 'queue_left':
        setIsInQueue(false);
        break;

      case 'chat_matched': {
        const chat = data.chat as Chat;
        setCurrentChat(chat);
        setIsInQueue(false);
        // Dispatch event for components that need to react (e.g., navigation)
        window.dispatchEvent(new CustomEvent('chatMatched', { detail: { chatId: chat.chat_id } }));
        break;
      }

      case 'chat_joined': {
        const chat = data.chat as Chat;
        setCurrentChat(chat);
        break;
      }

      case 'chat_left':
        setCurrentChat(null);
        setOtherUserTyping(false);
        break;

      case 'message': {
        const msg = data as unknown as ChatMessage;
        setCurrentChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, msg],
        } : null);
        break;
      }

      case 'chat_ended':
        setCurrentChat(null);
        setOtherUserTyping(false);
        window.dispatchEvent(new CustomEvent('chatEnded', { detail: { reason: 'ended' } }));
        break;

      case 'typing_start':
        setOtherUserTyping(true);
        break;

      case 'typing_stop':
        setOtherUserTyping(false);
        break;

      case 'activity_update': {
        const activityData = data.activity as ActivityData;
        setActivity(activityData);
        break;
      }

      case 'access_update': {
        const accessData = data.access as AccessData;
        setAccess(accessData);
        break;
      }

      case 'error':
        // Suppress "Not in a chat" errors as they're expected when chat ends
        if (data.message !== 'Not in a chat.') {
          console.error('WebSocket error from server:', data.message);
        }
        break;

      case 'pong':
        // Heartbeat response - connection alive
        break;

      default:
        console.log('Unknown message type:', type, data);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setAccess(null);
    setActivity(null);
    setIsInQueue(false);
    setCurrentChat(null);
    setOtherUserTyping(false);
  }, [clearTimers]);

  // Send action to server
  const sendAction = useCallback((action: string, payload?: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, ...payload }));
    }
  }, []);

  // ==================== Queue Actions ====================

  const joinQueue = useCallback(() => {
    sendAction('join_queue');
  }, [sendAction]);

  const leaveQueue = useCallback(() => {
    // Optimistic update for instant feedback
    setIsInQueue(false);
    sendAction('leave_queue');
  }, [sendAction]);

  // ==================== Chat Actions ====================

  const joinChat = useCallback((chatId: string) => {
    sendAction('join_chat', { chat_id: chatId });
  }, [sendAction]);

  const leaveChat = useCallback(() => {
    sendAction('leave_chat');
  }, [sendAction]);

  const sendMessage = useCallback((content: string) => {
    if (content.trim()) {
      sendAction('send_message', { content: content.trim() });
      // Stop typing when sending
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendAction('typing_stop');
      }
    }
  }, [sendAction]);

  const endChat = useCallback(() => {
    sendAction('end_chat');
  }, [sendAction]);

  // ==================== Typing ====================

  const startTyping = useCallback(() => {
    // Only send typing indicator if user is in a chat
    if (!currentChat) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendAction('typing_start');
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendAction('typing_stop');
      }
    }, 3000);
  }, [sendAction, currentChat]);

  const stopTyping = useCallback(() => {
    // Only send typing stop if user is in a chat
    if (!currentChat) {
      // Clear local state even if not in chat
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendAction('typing_stop');
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [sendAction, currentChat]);

  // ==================== Utility ====================

  const refresh = useCallback(() => {
    sendAction('refresh');
  }, [sendAction]);

  // ==================== Effects ====================

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && tokenData && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tokenData?.access, user?.id]);

  // ==================== Context Value ====================

  const value: MainWebSocketContextType = {
    isConnected,
    isConnecting,
    access,
    activity,
    isInQueue,
    joinQueue,
    leaveQueue,
    currentChat,
    joinChat,
    leaveChat,
    sendMessage,
    endChat,
    otherUserTyping,
    startTyping,
    stopTyping,
    refresh,
  };

  return (
    <MainWebSocketContext.Provider value={value}>
      {children}
    </MainWebSocketContext.Provider>
  );
};

// ==================== Hook ====================

export const useMainWebSocket = (): MainWebSocketContextType => {
  const context = useContext(MainWebSocketContext);
  if (context === undefined) {
    throw new Error('useMainWebSocket must be used within a MainWebSocketProvider');
  }
  return context;
};
