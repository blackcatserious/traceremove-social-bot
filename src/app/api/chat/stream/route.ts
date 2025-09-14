import { NextRequest, NextResponse } from 'next/server';

function detectLanguage(text: string): string {
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
  const apiKey = process.env.OPENAI_API_KEY;
  return !!(apiKey && !apiKey.includes('your_') && apiKey !== '');
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], conversationId, language = 'auto', model = 'gpt-4' } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const detectedLang = language === 'auto' ? detectLanguage(message) : language;
    
    const reply = "I'm digital Arthur Ziganshine, your comprehensive AI assistant! I can help with complete projects including content creation, strategy development, project management, analysis, and technical implementation. What comprehensive project would you like to develop together?";
    
    return NextResponse.json({
      reply,
      persona: 'comprehensive-ai',
      lang: detectedLang,
      conversationId,
      model,
      streaming: false,
      chatTitle: 'AI Assistant',
      chatSubtitle: 'How can I help?',
    });
    
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
