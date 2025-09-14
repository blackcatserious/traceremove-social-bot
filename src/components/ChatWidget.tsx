'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; url: string }>;
  attachments?: Array<{ name: string; url: string; type: string }>;
  model?: string;
  language?: string;
}

interface ChatResponse {
  reply?: string;
  persona?: string;
  lang?: string;
  chatTitle?: string;
  chatSubtitle?: string;
  result?: string;
  sources?: Array<{ title: string; url: string }>;
  model?: string;
  conversationId?: string;
  streaming?: boolean;
  usage?: any;
  attachments?: Array<{ name: string; url: string; type: string }>;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [conversationId, setConversationId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    loadConversationHistory();
    generateConversationId();
  }, []);

  const loadConversationHistory = () => {
    try {
      const saved = localStorage.getItem('chatWidget_conversation');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.messages || []);
        setConversationId(parsed.id || generateConversationId());
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const saveConversationHistory = (newMessages: Message[]) => {
    try {
      const conversation = {
        id: conversationId,
        messages: newMessages,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('chatWidget_conversation', JSON.stringify(conversation));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  };

  const generateConversationId = () => {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(id);
    return id;
  };

  const exportConversation = () => {
    try {
      const conversation = {
        id: conversationId,
        messages,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(conversation, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${conversationId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export conversation:', error);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem('chatWidget_conversation');
    generateConversationId();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.analysis) {
        const analysisPreview = result.analysis.length > 200 
          ? result.analysis.substring(0, 200) + '...' 
          : result.analysis;
        
        setInputValue(prev => 
          prev + (prev ? '\n\n' : '') + `📎 File attached: ${file.name}\n📋 Analysis: ${analysisPreview}`
        );
      } else {
        setInputValue(prev => 
          prev + (prev ? '\n\n' : '') + `📎 File attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
        );
      }
      
      setSelectedFile(file);
    } catch (error) {
      console.error('File upload error:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveConversationHistory(newMessages);
    setInputValue('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);
    setIsTyping(true);

    try {
      const endpoint = useXai ? '/api/xai-chat' : '/api/chat/stream';
      const payload = useXai
        ? { prompt: userMessage.content }
        : {
            message: userMessage.content,
            history: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            conversationId: conversationId || `conv_${Date.now()}`,
            language: 'auto',
            model: 'gpt-4',
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
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        saveConversationHistory(finalMessages);
      } else {
        if (data.chatTitle) setChatTitle(data.chatTitle);
        if (data.chatSubtitle) setChatSubtitle(data.chatSubtitle);
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply || 'I apologize, but I could not generate a response.',
          timestamp: new Date(),
          sources: data.sources,
        };
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        saveConversationHistory(finalMessages);
        
        try {
          await fetch('/api/analytics/realtime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'request_success',
              data: {
                model: data.model || 'gpt-4',
                responseTime: Date.now() - userMessage.timestamp.getTime(),
              }
            })
          });
        } catch (analyticsError) {
          console.error('Analytics tracking error:', analyticsError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      saveConversationHistory(finalMessages);
      
      try {
        await fetch('/api/analytics/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'request_error',
            data: { error: error instanceof Error ? error.message : 'Unknown error' }
          })
        });
      } catch (analyticsError) {
        console.error('Analytics tracking error:', analyticsError);
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
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
    <div className="chatwidget-container">
      {/* Chat Button - Always Visible */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatwidget-button"
          aria-label="Open AI Chat"
          title="Open AI Chat"
        >
          <MessageCircle size={24} />
          <div className="chatwidget-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatwidget-window">
          {/* Header */}
          <div className="chatwidget-header">
            <div>
              <h3 className="chatwidget-title">{chatTitle}</h3>
              <p className="chatwidget-subtitle">{chatSubtitle}</p>
            </div>
            <div className="chatwidget-header-actions">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="chatwidget-action-btn"
                title="Export Options"
              >
                💾
              </button>
              <button
                onClick={clearConversation}
                className="chatwidget-action-btn"
                title="Clear Conversation"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chatwidget-close"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
            
            {showExportMenu && (
              <div className="chatwidget-export-menu">
                <button onClick={() => { exportConversation(); setShowExportMenu(false); }}>
                  Export as JSON
                </button>
                <button onClick={() => { setShowExportMenu(false); }}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="chatwidget-messages">
            {messages.length === 0 && (
              <div className="chatwidget-welcome">
                <MessageCircle size={32} className="chatwidget-welcome-icon" />
                <p>Welcome! How can I help you today?</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatwidget-message ${message.role === 'user' ? 'chatwidget-message-user' : 'chatwidget-message-assistant'}`}
              >
                <div className="chatwidget-message-content">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chatwidget-link"
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
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="chatwidget-attachments">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="chatwidget-attachment">
                          <Paperclip className="chatwidget-attachment-icon" />
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chatwidget-attachment-link"
                          >
                            {attachment.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="chatwidget-sources">
                      <div className="chatwidget-sources-title">Sources:</div>
                      {message.sources.map((source, index) => (
                        <div key={index}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chatwidget-source-link"
                          >
                            {source.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="chatwidget-timestamp">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {(isLoading || isTyping) && (
              <div className="chatwidget-message chatwidget-message-assistant">
                <div className="chatwidget-message-content">
                  <div className="chatwidget-loading">
                    <div className="chatwidget-loading-dot"></div>
                    <div className="chatwidget-loading-dot"></div>
                    <div className="chatwidget-loading-dot"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatwidget-input-area">
            {selectedFile && (
              <div className="chatwidget-file-preview">
                <div className="chatwidget-file-info">
                  <Paperclip className="chatwidget-file-icon" />
                  <span>{selectedFile.name}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="chatwidget-file-remove"
                >
                  <X className="chatwidget-file-remove-icon" />
                </button>
              </div>
            )}
            
            <div className="chatwidget-input-row">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="chatwidget-file-input"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="chatwidget-attach-button"
                disabled={isLoading}
                title="Attach file"
              >
                <Paperclip size={16} />
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="chatwidget-textarea"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                className="chatwidget-send-button"
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
