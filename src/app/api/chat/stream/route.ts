import { NextRequest, NextResponse } from 'next/server';
import { getPersonaByHost, detectLanguage } from '@/lib/bot.config';
import { getContext } from '@/lib/rag';
import { generateResponse, pickModel } from '@/lib/models';
import { getEnvironmentConfig, shouldMockExternalApis } from '@/lib/env-validation';

function detectLanguageFromText(text: string): string {
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

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function hasValidOpenAIKey(): boolean {
  const config = getEnvironmentConfig();
  return !!(config?.openai?.apiKey && config.openai.apiKey.trim() !== '');
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], conversationId, language = 'auto', model = 'gpt-4', attachments = [] } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const host = request.headers.get('host') || 'traceremove.com';
    const persona = getPersonaByHost(host);
    
    const detectedLang = language === 'auto' ? detectLanguageFromText(message) : language;
    
    if (!hasValidOpenAIKey()) {
      console.log('Using mock response - OpenAI API key not configured');
      const reply = "I'm digital Arthur Ziganshine, your comprehensive AI assistant! I can help with complete projects including content creation, strategy development, project management, analysis, and technical implementation. What comprehensive project would you like to develop together?";
      
      return NextResponse.json({
        reply,
        persona: persona.id,
        lang: detectedLang,
        conversationId,
        model,
        streaming: false,
        chatTitle: persona.chatTitle || 'AI Assistant',
        chatSubtitle: persona.chatSubtitle || 'How can I help?',
      });
    }

    let context = '';
    try {
      context = await getContext(message, persona.id);
    } catch (error) {
      console.log('Context retrieval error:', error);
    }
    
    let systemPrompt = persona.systemPrompt;
    if (context) {
      systemPrompt += `\n\nRelevant context from knowledge base:\n${context}`;
    }
    
    const languageInstructions = {
      en: 'Respond in English.',
      es: 'Responde en español.',
      fr: 'Répondez en français.',
      ru: 'Отвечай на русском языке.'
    };
    
    if (languageInstructions[detectedLang as keyof typeof languageInstructions]) {
      systemPrompt += `\n\n${languageInstructions[detectedLang as keyof typeof languageInstructions]}`;
    }
    
    systemPrompt += `\n\nYou have access to comprehensive capabilities including:\n- Content creation and strategy\n- Project management and implementation\n- Development and technical solutions\n- Analysis and research\n- Multi-platform campaign management\n\nWhen users request complex projects, provide detailed, actionable responses with specific next steps and deliverables.`;
    
    if (attachments && attachments.length > 0) {
      systemPrompt += `\n\nThe user has attached ${attachments.length} file(s). Consider these attachments in your response and reference them appropriately.`;
    }
    
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];
    
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
    
    messages.push({ role: 'user', content: message });
    
    try {
      const modelConfig = pickModel({ 
        intent: 'qa', 
        length: message.length + systemPrompt.length,
        persona: persona.id
      });
      
      const response = await generateResponse(messages, modelConfig);
      const reply = response.content || 'I apologize, but I could not generate a response.';
      
      const sources = context ? [{ title: 'Knowledge Base', url: '#' }] : undefined;
      
      return NextResponse.json({
        reply,
        persona: persona.id,
        lang: detectedLang,
        conversationId,
        model: modelConfig.model,
        streaming: true,
        chatTitle: persona.chatTitle || 'AI Assistant',
        chatSubtitle: persona.chatSubtitle || 'How can I help?',
        sources,
        usage: response.usage,
        attachments: attachments || []
      });
      
    } catch (error) {
      console.log('Using mock response due to API error:', error instanceof Error ? error.message : 'Unknown error');
      const reply = "I'm digital Arthur Ziganshine, your comprehensive AI assistant! I can help with complete projects including content creation, strategy development, project management, analysis, and technical implementation. What comprehensive project would you like to develop together?";
      
      return NextResponse.json({
        reply,
        persona: persona.id,
        lang: detectedLang,
        conversationId,
        model,
        streaming: false,
        chatTitle: persona.chatTitle || 'AI Assistant',
        chatSubtitle: persona.chatSubtitle || 'How can I help?',
      });
    }
    
  } catch (error) {
    console.error('Stream chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
