import { useState, useEffect, useCallback } from 'react';

interface EnhancedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; url: string }>;
  attachments?: Array<{ name: string; url: string; type: string }>;
  language?: string;
  model?: string;
}

interface ChatSettings {
  language: string;
  model: string;
  enableTypingIndicator: boolean;
  enableSuggestions: boolean;
}

const defaultChatSettings: ChatSettings = {
  language: 'auto',
  model: 'gpt-4',
  enableTypingIndicator: true,
  enableSuggestions: true,
};

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function saveConversationToStorage(conversationId: string, messages: EnhancedMessage[]): void {
  try {
    const conversation = {
      id: conversationId,
      messages,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('chatWidget_conversation', JSON.stringify(conversation));
  } catch (error) {
    console.error('Failed to save conversation history:', error);
  }
}

function loadConversationFromStorage(): { id: string; messages: EnhancedMessage[] } | null {
  try {
    const saved = localStorage.getItem('chatWidget_conversation');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        id: parsed.id || generateConversationId(),
        messages: parsed.messages || [],
      };
    }
  } catch (error) {
    console.error('Failed to load conversation history:', error);
  }
  return null;
}

function exportConversation(conversationId: string, messages: EnhancedMessage[], settings?: ChatSettings): void {
  try {
    const conversation = {
      id: conversationId,
      messages,
      settings,
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
}

export function useEnhancedChat() {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [settings, setSettings] = useState<ChatSettings>(defaultChatSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = useCallback(() => {
    const saved = loadConversationFromStorage();
    if (saved) {
      setMessages(saved.messages);
      setConversationId(saved.id);
    } else {
      const newId = generateConversationId();
      setConversationId(newId);
    }
  }, []);

  const saveConversation = useCallback((newMessages: EnhancedMessage[]) => {
    saveConversationToStorage(conversationId, newMessages);
  }, [conversationId]);

  const addMessage = useCallback((message: EnhancedMessage) => {
    setMessages(prev => {
      const newMessages = [...prev, message];
      saveConversationToStorage(conversationId, newMessages);
      return newMessages;
    });
  }, [conversationId]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatWidget_conversation');
    const newId = generateConversationId();
    setConversationId(newId);
  }, []);

  const exportCurrentConversation = useCallback(() => {
    exportConversation(conversationId, messages, settings);
  }, [conversationId, messages, settings]);

  return {
    messages,
    conversationId,
    settings,
    isLoading,
    isTyping,
    setMessages,
    setSettings,
    setIsLoading,
    setIsTyping,
    addMessage,
    clearConversation,
    exportCurrentConversation,
    saveConversation,
  };
}
