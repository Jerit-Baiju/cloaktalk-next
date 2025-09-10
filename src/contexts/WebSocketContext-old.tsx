'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Types
export interface QueueStatus {
  waiting_count: number;
  college: string;
  college_id: number;
}

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

export interface WebSocketContextType {
  // Queue related
  queueStatus: QueueStatus | null;
  isInQueue: boolean;
  joinQueue: () => void;
  leaveQueue: () => void;
  
  // Chat related
  currentChat: Chat | null;
  isConnectedToChat: boolean;
  sendMessage: (content: string) => void;
  endChat: () => void;
  
  // Connection status
  isQueueConnected: boolean;
  isChatConnected: boolean;
  
  // Actions
  checkActiveChat: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, tokenData } = useAuth();
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isQueueConnected, setIsQueueConnected] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);
  
  // WebSocket refs
  const queueWsRef = useRef<WebSocket | null>(null);
  const chatWsRef = useRef<WebSocket | null>(null);
  
  // Get WebSocket URL
  const getWsUrl = useCallback((path: string) => {
    const baseWsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000';
    return `${baseWsUrl}${path}`;
  }, []);

  // Connect to queue WebSocket
  const connectToQueue = useCallback(() => {
    if (!user || !tokenData || queueWsRef.current) return;

    const wsUrl = getWsUrl('/ws/queue/');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to queue WebSocket');
      setIsQueueConnected(true);
      
      // Check initial queue status
      ws.send(JSON.stringify({ action: 'check_status' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'queue_status':
          setQueueStatus(data);
          break;
          
        case 'chat_matched':
          console.log('Match found!', data);
          setCurrentChat(null); // Will fetch chat details
          setIsInQueue(false);
          
          // Redirect to chat page or update state
          if (data.chat_id) {
            fetchChatDetails(data.chat_id);
          }
          break;
          
        case 'error':
          console.error('Queue error:', data.message);
          break;
          
        default:
          console.log('Queue message:', data);
      }
    };

    ws.onerror = (error) => {
      console.error('Queue WebSocket error:', error);
      setIsQueueConnected(false);
    };

    ws.onclose = () => {
      console.log('Queue WebSocket closed');
      setIsQueueConnected(false);
      queueWsRef.current = null;
      
      // Attempt to reconnect after 3 seconds if user is still authenticated
      if (user && tokenData) {
        setTimeout(connectToQueue, 3000);
      }
    };

    queueWsRef.current = ws;
  }, [user, tokenData, getWsUrl]);

  // API call to fetch chat details
  const fetchChatDetails = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/${chatId}/`, {
        headers: {
          'Authorization': `Bearer ${tokenData?.access}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const chatData = await response.json();
        setCurrentChat(chatData);
        connectToChat(chatId);
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
    }
  }, [tokenData]);

  // Update connectToQueue to include fetchChatDetails
  useEffect(() => {
    const connectToQueueWithFetch = () => {
      if (!user || !tokenData || queueWsRef.current) return;

      const wsUrl = getWsUrl('/ws/queue/');
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to queue WebSocket');
        setIsQueueConnected(true);
        
        // Check initial queue status
        ws.send(JSON.stringify({ action: 'check_status' }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'queue_status':
            setQueueStatus(data);
            break;
            
          case 'chat_matched':
            console.log('Match found!', data);
            setCurrentChat(null); // Will fetch chat details
            setIsInQueue(false);
            
            // Redirect to chat page or update state
            if (data.chat_id) {
              fetchChatDetails(data.chat_id);
            }
            break;
            
          case 'error':
            console.error('Queue error:', data.message);
            break;
            
          default:
            console.log('Queue message:', data);
        }
      };

      ws.onerror = (error) => {
        console.error('Queue WebSocket error:', error);
        setIsQueueConnected(false);
      };

      ws.onclose = () => {
        console.log('Queue WebSocket closed');
        setIsQueueConnected(false);
        queueWsRef.current = null;
        
        // Attempt to reconnect after 3 seconds if user is still authenticated
        if (user && tokenData) {
          setTimeout(connectToQueueWithFetch, 3000);
        }
      };

      queueWsRef.current = ws;
    };

    if (user && tokenData) {
      connectToQueueWithFetch();
    }
  }, [user, tokenData, getWsUrl, fetchChatDetails]);

  // Disconnect from chat WebSocket
  const disconnectFromChat = useCallback(() => {
    if (chatWsRef.current) {
      chatWsRef.current.close();
      chatWsRef.current = null;
      setIsChatConnected(false);
    }
  }, []);

  // Connect to chat WebSocket
  const connectToChat = useCallback((chatId: string) => {
    if (!user || !tokenData || chatWsRef.current) return;

    const wsUrl = getWsUrl(`/ws/chat/${chatId}/`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to chat WebSocket');
      setIsChatConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          if (currentChat) {
            setCurrentChat(prev => prev ? {
              ...prev,
              messages: [...prev.messages, data as ChatMessage]
            } : null);
          }
          break;
          
        case 'chat_ended':
          console.log('Chat ended');
          setCurrentChat(null);
          disconnectFromChat();
          break;
          
        case 'error':
          console.error('Chat error:', data.message);
          break;
          
        default:
          console.log('Chat message:', data);
      }
    };

    ws.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      setIsChatConnected(false);
    };

    ws.onclose = () => {
      console.log('Chat WebSocket closed');
      setIsChatConnected(false);
      chatWsRef.current = null;
    };

    chatWsRef.current = ws;
  }, [user, tokenData, getWsUrl, currentChat, disconnectFromChat]);

  // Check for active chat on mount
  const checkActiveChat = useCallback(async () => {
    if (!tokenData) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/active/`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.has_active_chat) {
          await fetchChatDetails(data.chat_id);
        }
      }
    } catch (error) {
      console.error('Error checking active chat:', error);
    }
  }, [tokenData, fetchChatDetails]);

  // Queue actions
  const joinQueue = useCallback(() => {
    if (queueWsRef.current && queueWsRef.current.readyState === WebSocket.OPEN) {
      queueWsRef.current.send(JSON.stringify({ action: 'join_queue' }));
      setIsInQueue(true);
    }
  }, []);

  const leaveQueue = useCallback(() => {
    if (queueWsRef.current && queueWsRef.current.readyState === WebSocket.OPEN) {
      queueWsRef.current.send(JSON.stringify({ action: 'leave_queue' }));
      setIsInQueue(false);
    }
  }, []);

  // Chat actions
  const sendMessage = useCallback((content: string) => {
    if (chatWsRef.current && chatWsRef.current.readyState === WebSocket.OPEN) {
      chatWsRef.current.send(JSON.stringify({
        action: 'send_message',
        content: content
      }));
    }
  }, []);

  const endChat = useCallback(() => {
    if (chatWsRef.current && chatWsRef.current.readyState === WebSocket.OPEN) {
      chatWsRef.current.send(JSON.stringify({ action: 'end_chat' }));
    }
  }, []);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (user && tokenData) {
      connectToQueue();
      checkActiveChat();
    } else {
      // Disconnect when user logs out
      if (queueWsRef.current) {
        queueWsRef.current.close();
      }
      if (chatWsRef.current) {
        chatWsRef.current.close();
      }
      setQueueStatus(null);
      setCurrentChat(null);
      setIsInQueue(false);
    }

    // Cleanup on unmount
    return () => {
      if (queueWsRef.current) {
        queueWsRef.current.close();
      }
      if (chatWsRef.current) {
        chatWsRef.current.close();
      }
    };
  }, [user, tokenData, connectToQueue, checkActiveChat]);

  const value: WebSocketContextType = {
    queueStatus,
    isInQueue,
    joinQueue,
    leaveQueue,
    currentChat,
    isConnectedToChat: isChatConnected,
    sendMessage,
    endChat,
    isQueueConnected,
    isChatConnected,
    checkActiveChat,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
