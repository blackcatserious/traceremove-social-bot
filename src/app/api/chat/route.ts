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

function generateMockResponse(message: string, persona: any, detectedLang: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (persona.id === 'philosopher') {
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech')) {
      return "Technology is not merely a tool but a fundamental extension of human consciousness. When we create digital systems, we're essentially externalizing our cognitive processes. The question isn't whether technology is good or bad, but how it shapes our understanding of what it means to be human in an interconnected world.";
    }
    if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
      return "Artificial intelligence represents a profound philosophical challenge to our anthropocentric worldview. We're not just building machines that think, but confronting the deeper question of what thinking itself means. The emergence of AI forces us to examine the boundaries between natural and artificial cognition.";
    }
    if (lowerMessage.includes('ethics') || lowerMessage.includes('ethical')) {
      return "Ethics in technology cannot be an afterthought. Every line of code embeds values, every algorithm makes moral choices. The architecture of our digital systems reflects and shapes the moral architecture of society. We must ask not just 'can we build this?' but 'should we build this?'";
    }
    return "Every technological advancement carries within it the seeds of both liberation and constraint. The key is understanding how these systems interact with human agency and social structures. What specific aspect of technology and human interaction would you like to explore further?";
  }
  
  if (persona.id === 'orm_multilang') {
    if (detectedLang === 'es') {
      if (lowerMessage.includes('reputación') || lowerMessage.includes('reputation')) {
        return "La gestión de reputación online requiere un enfoque estratégico y proactivo. Podemos ayudarte a monitorear menciones de tu marca, desarrollar contenido positivo, y crear estrategias de respuesta para comentarios negativos. ¿En qué plataformas específicas necesitas mejorar tu presencia?";
      }
      if (lowerMessage.includes('redes sociales') || lowerMessage.includes('social media')) {
        return "Las redes sociales son fundamentales para la reputación digital. Te ayudamos a crear calendarios de contenido, optimizar perfiles, y desarrollar estrategias de engagement auténtico. ¿Qué redes sociales son prioritarias para tu negocio?";
      }
      return "Soy tu asistente especializado en gestión de reputación online y marketing digital. Puedo ayudarte con estrategias de contenido, monitoreo de marca, gestión de crisis, y optimización de presencia digital. ¿En qué área específica necesitas apoyo?";
    }
    
    if (detectedLang === 'tr') {
      if (lowerMessage.includes('itibar') || lowerMessage.includes('reputation')) {
        return "Online itibar yönetimi, markanızın dijital varlığını güçlendirmek için stratejik bir yaklaşım gerektirir. Marka izleme, pozitif içerik geliştirme ve kriz yönetimi konularında size yardımcı olabilirim. Hangi platformlarda odaklanmak istiyorsunuz?";
      }
      if (lowerMessage.includes('sosyal medya') || lowerMessage.includes('social media')) {
        return "Sosyal medya stratejinizi güçlendirmek için içerik takvimi oluşturma, profil optimizasyonu ve etkileşim stratejileri geliştirebiliriz. Hangi sosyal medya platformları sizin için öncelikli?";
      }
      return "Online itibar yönetimi ve dijital pazarlama konularında uzmanlaşmış asistanınızım. İçerik stratejisi, marka izleme, kriz yönetimi ve dijital varlık optimizasyonu konularında size yardımcı olabilirim. Hangi alanda desteğe ihtiyacınız var?";
    }
    
    if (lowerMessage.includes('reputation') || lowerMessage.includes('brand')) {
      return "Online reputation management is crucial for business success. I can help you monitor brand mentions, develop positive content strategies, create response protocols for negative feedback, and build a strong digital presence. What specific reputation challenges are you facing?";
    }
    if (lowerMessage.includes('social media') || lowerMessage.includes('content')) {
      return "Social media content strategy should align with your brand values and audience needs. I can assist with content calendars, platform optimization, engagement strategies, and performance analytics. Which platforms are most important for your business?";
    }
    if (lowerMessage.includes('crisis') || lowerMessage.includes('negative')) {
      return "Crisis management requires swift, strategic response. I can help you develop crisis communication protocols, draft appropriate responses, and implement reputation recovery strategies. What type of situation are you dealing with?";
    }
    return "I'm your ORM and brand reputation assistant. I specialize in online reputation management, content strategy, social media optimization, and digital marketing. I can help with brand monitoring, crisis management, content planning, and building positive online presence. How can I assist you today?";
  }
  
  if (persona.id === 'orm_russian') {
    if (lowerMessage.includes('репутация') || lowerMessage.includes('reputation')) {
      return "Управление онлайн-репутацией требует системного подхода. Помогу настроить мониторинг упоминаний бренда, разработать стратегию позитивного контента и создать протоколы реагирования на негативные отзывы. На каких платформах нужно улучшить присутствие?";
    }
    if (lowerMessage.includes('соцсети') || lowerMessage.includes('социальные сети')) {
      return "Социальные сети — ключевой инструмент репутационного менеджмента. Разработаю контент-план, оптимизирую профили и создам стратегию вовлечения аудитории. Какие платформы приоритетны для вашего бизнеса?";
    }
    if (lowerMessage.includes('кризис') || lowerMessage.includes('негатив')) {
      return "Кризисные ситуации требуют быстрого и профессионального реагирования. Помогу разработать протоколы антикризисных коммуникаций и стратегию восстановления репутации. С какой ситуацией работаем?";
    }
    return "Я ваш ORM-ассистент по управлению репутацией. Специализируюсь на мониторинге упоминаний, разработке контент-стратегий, антикризисных коммуникациях и построении позитивного имиджа в интернете. Чем могу помочь?";
  }
  
  return "I'm here to help! Could you please tell me more about what you'd like to discuss?";
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
    
    let reply: string;
    
    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      reply = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.log('Using mock response due to API configuration:', error instanceof Error ? error.message : 'Unknown error');
      reply = generateMockResponse(message, persona, detectedLang);
    }
    
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
