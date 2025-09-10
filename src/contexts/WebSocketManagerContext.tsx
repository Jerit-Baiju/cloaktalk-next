'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useChatWebSocket } from './ChatWebSocketContext';
import { useQueueWebSocket } from './QueueWebSocketContext';

interface WebSocketManagerContextType {
  checkActiveChat: () => Promise<void>;
}

const WebSocketManagerContext = createContext<WebSocketManagerContextType | undefined>(undefined);

interface WebSocketManagerProviderProps {
  children: React.ReactNode;
}

export const WebSocketManagerProvider: React.FC<WebSocketManagerProviderProps> = ({ children }) => {
  const { tokenData } = useAuth();
  const queueWS = useQueueWebSocket();
  const chatWS = useChatWebSocket();
  const connectToChatRef = useRef<typeof chatWS.connectToChat | null>(null);

  // Keep the ref updated with the latest connectToChat function
  useEffect(() => {
    connectToChatRef.current = chatWS.connectToChat;
  }, [chatWS.connectToChat]);

  // Check for active chat from API
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
        if (data.has_active_chat && data.chat_id && connectToChatRef.current) {
          console.log('Found active chat:', data.chat_id);
          // Auto-connect to the active chat
          await connectToChatRef.current(data.chat_id);
        }
      }
    } catch (error) {
      console.error('Error checking active chat:', error);
    }
  }, [tokenData]); // Remove chatWS dependency to prevent infinite loop

  // Check for active chat when components mount
  useEffect(() => {
    if (tokenData && queueWS.isConnected) {
      checkActiveChat();
    }
  }, [tokenData, queueWS.isConnected, checkActiveChat]);

  const value: WebSocketManagerContextType = {
    checkActiveChat,
  };

  return (
    <WebSocketManagerContext.Provider value={value}>
      {children}
    </WebSocketManagerContext.Provider>
  );
};

export const useWebSocketManager = (): WebSocketManagerContextType => {
  const context = useContext(WebSocketManagerContext);
  if (context === undefined) {
    throw new Error('useWebSocketManager must be used within a WebSocketManagerProvider');
  }
  return context;
};
