'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; url: string }>;
  attachments?: Array<{ name: string; url: string; type: string }>;
}


interface ChatResponse {
  reply?: string;
  persona?: string;
  lang?: string;
  chatTitle?: string;
  chatSubtitle?: string;
  result?: string; // for xai-chat
  sources?: Array<{ title: string; url: string }>;
}

type ChatWidgetProps = {
  useXai?: boolean;
};

export default function ChatWidget({ useXai = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState('AI Assistant');
  const [chatSubtitle, setChatSubtitle] = useState('How can I help?');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('File upload failed');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;

    setHasError(false);

    let attachments: Array<{ name: string; url: string; type: string }> = [];
    
    if (selectedFile) {
      try {
        const fileUrl = await uploadFile(selectedFile);
        attachments.push({
          name: selectedFile.name,
          url: fileUrl,
          type: selectedFile.type,
        });
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim() || (selectedFile ? `Uploaded file: ${selectedFile.name}` : ''),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);

    try {
      const endpoint = useXai ? '/api/xai-chat' : '/api/chat';
      const payload = useXai
        ? { prompt: userMessage.content }
        : {
            message: userMessage.content,
            history: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            attachments: userMessage.attachments,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (useXai) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.result || 'No response from xai model.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        if (data.chatTitle) setChatTitle(data.chatTitle);
        if (data.chatSubtitle) setChatSubtitle(data.chatSubtitle);
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply || 'I apologize, but I could not generate a response.',
          timestamp: new Date(),
          sources: data.sources,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setHasError(true);
      
      try {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } catch (stateError) {
        console.error('Error updating message state:', stateError);
        setInputValue('');
        setIsOpen(true);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        const textarea = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-widget">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              setHasError(false);
            }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full border-none shadow-xl cursor-pointer flex items-center justify-center backdrop-blur-sm"
            style={{
              zIndex: 9999,
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
            aria-label="Open chat"
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MessageCircle size={24} />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-400 opacity-30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-xl flex flex-col border border-gray-200"
            style={{
              zIndex: 9999,
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
            }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-2xl"
            >
              <div>
                <h3 className="text-gray-900 font-semibold text-sm">{chatTitle}</h3>
                <p className="text-gray-600 text-xs">{chatSubtitle}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close chat"
              >
                <X size={18} />
              </motion.button>
            </motion.div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50">
              <AnimatePresence>
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-gray-500 text-sm mt-8"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <MessageCircle size={32} className="mx-auto mb-3 text-gray-400" />
                    </motion.div>
                    <p>Welcome! How can I help you today?</p>
                  </motion.div>
                )}
                
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-gray-800 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                      style={{
                        boxShadow: message.role === 'user' 
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <div className="whitespace-pre-wrap m-0">
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs">
                              <Paperclip className="w-3 h-3" />
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-300 hover:text-blue-100 underline"
                              >
                                {attachment.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs font-semibold mb-1 text-gray-600">Sources:</div>
                          {message.sources.map((source, index) => (
                            <div key={index} className="text-xs">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-300 hover:text-blue-100 underline"
                              >
                                {source.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 m-0 ${
                        message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white text-gray-900 rounded-2xl px-4 py-3 text-sm border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 border-t border-gray-200 bg-white rounded-b-2xl"
            >
              {selectedFile && (
                <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-xl px-3 py-3 text-sm transition-all duration-200 border border-gray-300"
                  disabled={isLoading}
                >
                  <Paperclip size={16} />
                </motion.button>
                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-white text-gray-900 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200"
                  rows={1}
                  disabled={isLoading}
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-sm transition-all duration-200"
                  style={{
                    boxShadow: (!inputValue.trim() && !selectedFile) || isLoading 
                      ? '0 2px 4px rgba(0, 0, 0, 0.1)' 
                      : '0 2px 8px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  <motion.div
                    animate={{ rotate: isLoading ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                  >
                    <Send size={16} />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
