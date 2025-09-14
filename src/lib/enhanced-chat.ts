export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  initialMessage: string;
}

export interface ChatSettings {
  language: string;
  model: string;
  enableTypingIndicator: boolean;
  enableSuggestions: boolean;
}

export interface EnhancedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; url: string }>;
  attachments?: Array<{ name: string; url: string; type: string }>;
  language?: string;
  model?: string;
}

export const defaultConversationTemplates: ConversationTemplate[] = [
  {
    id: 'content_creation',
    name: 'Content Creation',
    description: 'Help with writing, editing, and content strategy',
    initialMessage: 'I need help with content creation. Can you assist me with writing, editing, or developing a content strategy?',
  },
  {
    id: 'project_management',
    name: 'Project Management',
    description: 'Project planning, task organization, and workflow optimization',
    initialMessage: 'I need assistance with project management. Can you help me plan, organize tasks, and optimize workflows?',
  },
  {
    id: 'technical_analysis',
    name: 'Technical Analysis',
    description: 'Code review, architecture decisions, and technical implementation',
    initialMessage: 'I need technical analysis and implementation guidance. Can you help with code review, architecture, or technical decisions?',
  },
  {
    id: 'strategy_development',
    name: 'Strategy Development',
    description: 'Business strategy, planning, and decision-making support',
    initialMessage: 'I need help with strategy development. Can you assist with business planning, strategic decisions, and implementation roadmaps?',
  },
];

export const defaultChatSettings: ChatSettings = {
  language: 'auto',
  model: 'gpt-4',
  enableTypingIndicator: true,
  enableSuggestions: true,
};

export function detectLanguage(text: string): string {
  const russianPattern = /[а-яё]/i;
  const spanishPattern = /[ñáéíóúü]/i;
  const frenchPattern = /[àâäéèêëïîôöùûüÿç]/i;
  const germanPattern = /[äöüß]/i;
  
  if (russianPattern.test(text)) return 'ru';
  if (spanishPattern.test(text)) return 'es';
  if (frenchPattern.test(text)) return 'fr';
  if (germanPattern.test(text)) return 'de';
  return 'en';
}

export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function saveConversationToStorage(conversationId: string, messages: EnhancedMessage[]): void {
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

export function loadConversationFromStorage(): { id: string; messages: EnhancedMessage[] } | null {
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

export function exportConversation(conversationId: string, messages: EnhancedMessage[], settings?: ChatSettings): void {
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
