'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  
  // Get WebSocket URL with token
  const getWsUrl = (path: string) => {
    const baseWsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000';
    const token = tokenData?.access;
    const url = `${baseWsUrl}${path}`;
    
    // Add token as query parameter if available
    if (token) {
      const separator = path.includes('?') ? '&' : '?';
      return `${url}${separator}token=${token}`;
    }
    
    return url;
  };

  // Check for active chat
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
          // Fetch chat details
          const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/${data.chat_id}/`, {
            headers: {
              'Authorization': `Bearer ${tokenData.access}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            setCurrentChat(chatData);
            
            // Connect to chat WebSocket
            const wsUrl = getWsUrl(`/ws/chat/${data.chat_id}/`);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
              console.log('Connected to chat WebSocket');
              setIsChatConnected(true);
            };

            ws.onmessage = (event) => {
              const data = JSON.parse(event.data);
              
              switch (data.type) {
                case 'message':
                  setCurrentChat(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, data as ChatMessage]
                  } : null);
                  break;
                  
                case 'chat_ended':
                  console.log('Chat ended');
                  setCurrentChat(null);
                  if (chatWsRef.current) {
                    chatWsRef.current.close();
                    chatWsRef.current = null;
                  }
                  setIsChatConnected(false);
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
          }
        }
      }
    } catch (error) {
      console.error('Error checking active chat:', error);
    }
  }, [tokenData]);

  // Connect to queue WebSocket
  useEffect(() => {
    if (!user || !tokenData) {
      // Cleanup when user logs out
      if (queueWsRef.current) {
        queueWsRef.current.close();
        queueWsRef.current = null;
      }
      if (chatWsRef.current) {
        chatWsRef.current.close();
        chatWsRef.current = null;
      }
      setQueueStatus(null);
      setCurrentChat(null);
      setIsInQueue(false);
      setIsQueueConnected(false);
      setIsChatConnected(false);
      return;
    }

    if (queueWsRef.current) return; // Already connected

    const connectToQueue = () => {
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
            setCurrentChat(null);
            setIsInQueue(false);
            
            if (data.chat_id) {
              // Trigger a check for active chat to get the new chat
              setTimeout(() => checkActiveChat(), 500);
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
    };

    connectToQueue();
    checkActiveChat();

    // Cleanup on unmount or dependency change
    return () => {
      if (queueWsRef.current) {
        queueWsRef.current.close();
        queueWsRef.current = null;
      }
      if (chatWsRef.current) {
        chatWsRef.current.close();
        chatWsRef.current = null;
      }
    };
  }, [user, tokenData, checkActiveChat]);

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
