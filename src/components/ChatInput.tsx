'use client';

import { useChat } from '@/contexts/ChatContext';
import React, { useEffect, useRef, useState } from 'react';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import { HiMicrophone, HiPaperClip } from 'react-icons/hi2';
import { IoSend } from 'react-icons/io5';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, setIsTyping } = useChat();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() || selectedFiles.length > 0) {
      // For now, just send the message. File handling can be added to ChatContext later
      sendMessage(message.trim());
      console.log('Selected files:', selectedFiles);
      setMessage('');
      setSelectedFiles([]);
      
      // Simulate typing indicator for response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Reset the input value so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    console.log('Voice recording toggled');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-700 mr-2 max-w-32 truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Input Container */}
        <div className="rounded-2xl shadow-sm border border-gray-200/50 p-2">
          <div className="flex items-center justify-center space-x-2">
            {/* Attachment Button */}
            <button
              onClick={handleAttachmentClick}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700"
            >
              <HiPaperClip className="text-lg" />
            </button>

            {/* Message Input Container */}
            <div className="flex-1 relative flex items-center">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-3 py-2 bg-transparent border-none resize-none focus:outline-none text-gray-800 placeholder-gray-500 text-sm leading-5"
                rows={1}
                style={{
                  minHeight: '36px',
                  maxHeight: '120px',
                }}
              />
              {/* Character count for long messages */}
              {message.length > 500 && (
                <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                  {message.length}/1000
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-1">
              {/* Emoji Button */}
              <button
                onClick={() => console.log('Emoji picker')}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all duration-200 text-gray-600 hover:text-gray-700"
              >
                <HiOutlineEmojiHappy className="text-lg" />
              </button>

              {/* Voice/Send Button */}
              {message.trim() || selectedFiles.length > 0 ? (
                <button
                  onClick={handleSend}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  <IoSend className="text-base ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={handleVoiceRecord}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isRecording 
                      ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <HiMicrophone className="text-lg" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="mt-2 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600 font-medium">Recording...</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
