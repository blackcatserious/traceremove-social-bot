import { NextRequest, NextResponse } from 'next/server';
import { getPersonaByHost, detectLanguage } from '@/lib/bot.config';
import { getContext } from '@/lib/rag';
import OpenAI from 'openai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === '') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const host = request.headers.get('host') || 'traceremove.com';
    const persona = getPersonaByHost(host);
    
    const detectedLang = detectLanguage(message, persona.languages);
    
    const context = await getContext(message, persona.id);
    
    let systemPrompt = persona.systemPrompt;
    if (context) {
      systemPrompt += `\n\nRelevant context from knowledge base:\n${context}`;
    }
    
    const languageInstructions = {
      en: 'Respond in English.',
      es: 'Responde en español.',
      tr: 'Türkçe yanıt ver.',
      ru: 'Отвечай на русском языке.'
    };
    
    if (languageInstructions[detectedLang as keyof typeof languageInstructions]) {
      systemPrompt += `\n\n${languageInstructions[detectedLang as keyof typeof languageInstructions]}`;
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
    
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const reply = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    
    return NextResponse.json({
      reply,
      persona: persona.id,
      lang: detectedLang,
      chatTitle: persona.chatTitle,
      chatSubtitle: persona.chatSubtitle
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat API endpoint is active',
    timestamp: new Date().toISOString(),
    note: 'Use POST with message and optional history to chat'
  });
}
