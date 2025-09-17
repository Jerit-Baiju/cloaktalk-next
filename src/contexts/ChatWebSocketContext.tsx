'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

// Types
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

export interface ParticipantStatus {
  user_id: string;
  is_online: boolean;
  last_seen?: string;
}

export interface ChatWebSocketContextType {
  // Chat state
  currentChat: Chat | null;
  isConnected: boolean;
  isConnecting: boolean;
  participantStatuses: ParticipantStatus[];
  
  // Chat actions
  sendMessage: (content: string) => void;
  endChat: () => void;
  
  // Connection management
  connectToChat: (chatId: string) => Promise<'connected' | 'not_found' | 'forbidden' | 'error'>;
  disconnect: () => void;
  
  // Utility
  isTyping: boolean;
  otherUserTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextType | undefined>(undefined);

interface ChatWebSocketProviderProps {
  children: React.ReactNode;
}

export const ChatWebSocketProvider: React.FC<ChatWebSocketProviderProps> = ({ children }) => {
  const { user, tokenData } = useAuth();
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participantStatuses, setParticipantStatuses] = useState<ParticipantStatus[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectToChatRef = useRef<(chatId: string) => Promise<'connected' | 'not_found' | 'forbidden' | 'error'> | null>(null);

  // Get WebSocket URL with token
  const getWsUrl = useCallback((chatId: string) => {
    const baseWsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000';
    const token = tokenData?.access;
    const url = `${baseWsUrl}/ws/chat/${chatId}/`;
    
    // Add token as query parameter if available
    if (token) {
      return `${url}?token=${token}`;
    }
    
    return url;
  }, [tokenData?.access]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
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

  // Connect to a specific chat
  const connectToChat = useCallback(async (chatId: string) => {
    if (!tokenData || isConnecting) return 'error';
    
    setIsConnecting(true);
    
    try {
      // First, fetch chat details via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/${chatId}/`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        setIsConnecting(false);
        return 'not_found';
      }
      
      if (response.status === 403) {
        setIsConnecting(false);
        return 'forbidden';
      }
      
      if (!response.ok) {
        setIsConnecting(false);
        return 'error';
      }

      const chatData = await response.json();
      
      // Disconnect from any existing connection
      if (wsRef.current) {
        wsRef.current.close(1000, 'Switching chats');
        wsRef.current = null;
      }

      // Connect to chat WebSocket
      console.log('Connecting to chat WebSocket:', chatId);
      const wsUrl = getWsUrl(chatId);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Chat WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setCurrentChat(chatData);
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // Every 30 seconds
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Chat WebSocket message:', data);

        switch (data.type) {
          case 'message':
            setCurrentChat(prev => prev ? {
              ...prev,
              messages: [...prev.messages, data as ChatMessage]
            } : null);
            break;

          case 'chat_ended':
            console.log('Chat ended by other user');
            setCurrentChat(null);
            
            // Close the WebSocket connection
            if (wsRef.current) {
              wsRef.current.close(1000, 'Chat ended');
              wsRef.current = null;
            }
            setIsConnected(false);
            clearTimers();
            
            // Notify parent components
            window.dispatchEvent(new CustomEvent('chatEnded', { 
              detail: { reason: 'ended_by_other' } 
            }));
            break;

          case 'participant_status':
            console.log('Participant status update:', data);
            if (data.participants) {
              setParticipantStatuses(data.participants);
            }
            break;

          case 'typing_start':
            if (data.user_id !== user?.id?.toString()) {
              setOtherUserTyping(true);
            }
            break;

          case 'typing_stop':
            if (data.user_id !== user?.id?.toString()) {
              setOtherUserTyping(false);
            }
            break;

          case 'user_presence':
            console.log('User presence update:', data);
            setParticipantStatuses(prev => {
              const updated = [...prev];
              const index = updated.findIndex(p => p.user_id === data.user_id);
              if (index >= 0) {
                updated[index] = {
                  ...updated[index],
                  is_online: data.is_online,
                  last_seen: data.last_seen
                };
              } else {
                updated.push({
                  user_id: data.user_id,
                  is_online: data.is_online,
                  last_seen: data.last_seen
                });
              }
              return updated;
            });
            break;

          case 'error':
            console.error('Chat WebSocket error:', data.message);
            break;

          case 'pong':
            // Heartbeat response - connection is alive
            break;

          default:
            console.log('Unknown chat message type:', data);
        }
      };

      ws.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log('Chat WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        clearTimers();
        wsRef.current = null;
        
        // Only clear chat data if it was an unexpected disconnect
        if (event.code !== 1000) {
          setCurrentChat(null);
          setParticipantStatuses([]);
        }
      };

      wsRef.current = ws;
      return 'connected';

    } catch (error) {
      console.error('Error connecting to chat:', error);
      setIsConnecting(false);
      return 'error';
    }
  }, [tokenData, isConnecting, getWsUrl, sendHeartbeat, user, clearTimers]);

  // Update the ref whenever connectToChat changes
  useEffect(() => {
    connectToChatRef.current = connectToChat;
  }, [connectToChat]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('Disconnecting from chat WebSocket...');
    clearTimers();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setCurrentChat(null);
    setParticipantStatuses([]);
    setIsTyping(false);
    setOtherUserTyping(false);
  }, [clearTimers]);

  // Typing indicators  
  const stopTyping = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isTyping) {
      setIsTyping(false);
      wsRef.current.send(JSON.stringify({ action: 'typing_stop' }));
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [isTyping]);

  const startTyping = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isTyping) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({ action: 'typing_start' }));
      
      // Auto-stop typing after 3 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  }, [isTyping, stopTyping]);

  // Chat actions
  const sendMessage = useCallback((content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && content.trim()) {
      console.log('Sending message:', content);
      wsRef.current.send(JSON.stringify({
        action: 'send_message',
        content: content.trim()
      }));
      
      // Stop typing when sending message
      if (isTyping) {
        stopTyping();
      }
    }
  }, [isTyping, stopTyping]);

  const endChat = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Ending chat...');
      wsRef.current.send(JSON.stringify({ action: 'end_chat' }));
      
      // Immediately handle chat end for current user
      setCurrentChat(null);
      
      // Close the WebSocket connection
      wsRef.current.close(1000, 'Chat ended by user');
      wsRef.current = null;
      setIsConnected(false);
      clearTimers();
      
      // Notify parent components
      window.dispatchEvent(new CustomEvent('chatEnded', { 
        detail: { reason: 'ended_by_user' } 
      }));
    }
  }, [clearTimers]);

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!user || !tokenData) {
      disconnect();
    }
  }, [user, tokenData, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Listen for chat match events from queue
  useEffect(() => {
    const handleChatMatched = (event: CustomEvent) => {
      const { chatId } = event.detail;
      if (chatId && connectToChatRef.current) {
        console.log('Auto-connecting to matched chat:', chatId);
        connectToChatRef.current(chatId);
      }
    };

    window.addEventListener('chatMatched', handleChatMatched as EventListener);
    return () => window.removeEventListener('chatMatched', handleChatMatched as EventListener);
  }, []); // Safe to use empty dependency array since we're using ref

  const value: ChatWebSocketContextType = {
    currentChat,
    isConnected,
    isConnecting,
    participantStatuses,
    sendMessage,
    endChat,
    connectToChat,
    disconnect,
    isTyping,
    otherUserTyping,
    startTyping,
    stopTyping,
  };

  return (
    <ChatWebSocketContext.Provider value={value}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};

export const useChatWebSocket = (): ChatWebSocketContextType => {
  const context = useContext(ChatWebSocketContext);
  if (context === undefined) {
    throw new Error('useChatWebSocket must be used within a ChatWebSocketProvider');
  }
  return context;
};
