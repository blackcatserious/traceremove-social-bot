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
  template?: string;
}

interface ConversationTemplate {
  id: string;
  title: string;
  systemPrompt: string;
  starterQuestions: string[];
  category: string;
}

const conversationTemplates: ConversationTemplate[] = [
  {
    id: 'project-planning',
    title: 'Project Planning',
    systemPrompt: 'You are a comprehensive project planning assistant. Help users create detailed project plans with timelines, resources, and deliverables. Focus on practical implementation and actionable steps.',
    starterQuestions: [
      'What type of project are you planning?',
      'What are your main objectives?',
      'What resources do you have available?',
      'What is your timeline for completion?'
    ],
    category: 'Business'
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    systemPrompt: 'You are a comprehensive content creation assistant. Help users develop content strategies, write engaging content, and optimize for different platforms. Focus on audience engagement and brand consistency.',
    starterQuestions: [
      'What type of content do you want to create?',
      'Who is your target audience?',
      'What platforms will you use?',
      'What is your content goal?'
    ],
    category: 'Marketing'
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis',
    systemPrompt: 'You are a comprehensive technical analysis assistant. Help users analyze systems, code, and technical solutions with detailed insights. Focus on architecture, performance, and best practices.',
    starterQuestions: [
      'What system or technology do you want to analyze?',
      'What specific aspects are you interested in?',
      'What are your technical requirements?',
      'What challenges are you facing?'
    ],
    category: 'Technology'
  },
  {
    id: 'strategy-development',
    title: 'Strategy Development',
    systemPrompt: 'You are a comprehensive strategy development assistant. Help users create strategic plans, analyze market opportunities, and develop competitive advantages. Focus on actionable insights and measurable outcomes.',
    starterQuestions: [
      'What strategic challenge are you facing?',
      'What is your current market position?',
      'What are your key objectives?',
      'What resources can you leverage?'
    ],
    category: 'Business'
  },
  {
    id: 'research-analysis',
    title: 'Research & Analysis',
    systemPrompt: 'You are a comprehensive research and analysis assistant. Help users conduct thorough research, analyze data, and draw meaningful conclusions. Focus on evidence-based insights and comprehensive coverage.',
    starterQuestions: [
      'What topic do you want to research?',
      'What specific questions need answers?',
      'What type of analysis do you need?',
      'How will you use these insights?'
    ],
    category: 'Research'
  }
];

const defaultChatSettings: ChatSettings = {
  language: 'auto',
  model: 'gpt-4',
  enableTypingIndicator: true,
  enableSuggestions: true,
  template: undefined,
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
  const [suggestions, setSuggestions] = useState<Array<{ title: string; preview: string; relevance: number }>>([]);

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

  const switchTemplate = useCallback((templateId: string) => {
    const template = conversationTemplates.find(t => t.id === templateId);
    if (template) {
      setSettings(prev => ({ ...prev, template: templateId }));
      
      const welcomeMessage: EnhancedMessage = {
        id: `template_${Date.now()}`,
        role: 'assistant',
        content: `I've switched to **${template.title}** mode. ${template.starterQuestions.length > 0 ? `Here are some questions to get started:\n\n${template.starterQuestions.map(q => `• ${q}`).join('\n')}` : ''}`,
        timestamp: new Date(),
      };
      
      addMessage(welcomeMessage);
    }
  }, [addMessage]);

  const getSuggestions = useCallback(async (query: string) => {
    if (!settings.enableSuggestions || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch('/api/chat/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    }
  }, [settings.enableSuggestions]);

  return {
    messages,
    conversationId,
    settings,
    isLoading,
    isTyping,
    suggestions,
    conversationTemplates,
    setMessages,
    setSettings,
    setIsLoading,
    setIsTyping,
    addMessage,
    clearConversation,
    exportCurrentConversation,
    saveConversation,
    switchTemplate,
    getSuggestions,
  };
}
