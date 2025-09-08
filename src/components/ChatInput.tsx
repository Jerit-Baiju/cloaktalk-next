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
    <div className="relative z-10 border-t border-neutral-800/80 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50 px-3 py-3 sm:px-6">
      <div className="max-w-3xl mx-auto">
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
            <div className="rounded-xl bg-neutral-900/70 border border-neutral-800 p-3">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-300">
                    <span className="mr-2 max-w-40 truncate" title={file.name}>{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-neutral-500 hover:text-pink-400 transition-colors"
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
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur p-2">
          <div className="flex items-center justify-center gap-2">
            {/* Attachment Button */}
            <button
              onClick={handleAttachmentClick}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border border-neutral-700"
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
                className="w-full px-3 py-2 bg-transparent border-none resize-none focus:outline-none text-neutral-100 placeholder-neutral-500 text-sm leading-5"
                rows={1}
                style={{
                  minHeight: '36px',
                  maxHeight: '120px',
                }}
              />
              {/* Character count for long messages */}
              {message.length > 500 && (
                <div className="absolute bottom-1 right-2 text-[10px] text-neutral-500">
                  {message.length}/1000
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Emoji Button */}
              <button
                onClick={() => console.log('Emoji picker')}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors text-neutral-400 hover:text-neutral-200 border border-neutral-700"
              >
                <HiOutlineEmojiHappy className="text-lg" />
              </button>

              {/* Voice/Send Button */}
              {message.trim() || selectedFiles.length > 0 ? (
                <button
                  onClick={handleSend}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:from-pink-500 hover:to-rose-600 text-white flex items-center justify-center transition-transform duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <IoSend className="text-base ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={handleVoiceRecord}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 border ${
                    isRecording 
                      ? 'bg-red-600 text-white border-red-500 shadow-inner animate-pulse' 
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border-neutral-700'
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
          <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium">Recording…</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
