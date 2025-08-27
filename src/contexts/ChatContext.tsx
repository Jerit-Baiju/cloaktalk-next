'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isMe: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

interface ChatContextType {
  messages: Message[];
  currentChat: ChatUser | null;
  isTyping: boolean;
  sendMessage: (content: string) => void;
  setCurrentChat: (chat: ChatUser) => void;
  setIsTyping: (typing: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! I\'m in the same major as you. Want to study together for the midterm? 📚',
      senderId: 'user2',
      senderName: 'StudyBuddy',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      isMe: false,
    },
    {
      id: '2',
      content: 'Absolutely! This anonymous feature makes it so much easier to reach out. Library at 3pm? ✨',
      senderId: 'user1',
      senderName: 'You',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      isMe: true,
    },
    {
      id: '3',
      content: 'Perfect! I love how safe this app feels for making new connections 🛡️',
      senderId: 'user2',
      senderName: 'StudyBuddy',
      timestamp: new Date(Date.now() - 30000), // 30 seconds ago
      isMe: false,
    },
  ]);

  const [currentChat, setCurrentChat] = useState<ChatUser | null>({
    id: 'user2',
    name: 'Anonymous Buddy',
    avatar: '/beanhead.svg',
    isOnline: true,
  });

  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: 'user1',
      senderName: 'You',
      timestamp: new Date(),
      isMe: true,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      currentChat,
      isTyping,
      sendMessage,
      setCurrentChat,
      setIsTyping,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
