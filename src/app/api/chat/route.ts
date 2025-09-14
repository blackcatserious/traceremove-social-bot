import { NextRequest, NextResponse } from 'next/server';
import { getPersonaByHost, detectLanguage } from '@/lib/bot.config';
import { getContext } from '@/lib/rag';
import { ContentGenerator } from '@/lib/generator';
import { generateResponse, pickModel } from '@/lib/models';
import { getEnvironmentConfig, shouldMockExternalApis } from '@/lib/env-validation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';


function hasValidOpenAIKey(): boolean {
  const config = getEnvironmentConfig();
  return !!(config?.openai?.apiKey && config.openai.apiKey.trim() !== '');
}

async function generateComprehensiveResponse(message: string, persona: any): Promise<string> {
  const generator = new ContentGenerator();
  
  const isProjectRequest = /create|build|develop|implement|generate|make/i.test(message);
  const isAnalysisRequest = /analyze|research|study|investigate|examine/i.test(message);
  const isStrategyRequest = /strategy|plan|approach|roadmap|framework/i.test(message);
  
  if (isProjectRequest) {
    try {
      const result = await generator.generateComprehensiveContent({
        type: 'project',
        topic: message,
        requirements: ['Comprehensive planning', 'Resource allocation', 'Timeline development'],
        deliverables: ['Project plan', 'Implementation guide', 'Success metrics'],
        audience: 'stakeholders'
      });
      
      return `I can help you with this comprehensive project. Here's my initial assessment:\n\n${result.content[0]?.content}\n\n**Next Steps:**\n${result.nextSteps.map(step => `• ${step}`).join('\n')}\n\n**Deliverables:**\n${result.deliverables.map(d => `• ${d}`).join('\n')}`;
    } catch (error) {
      console.error('Project generation error:', error);
    }
  }
  
  if (isAnalysisRequest) {
    try {
      const result = await generator.generateComprehensiveContent({
        type: 'analysis',
        topic: message,
        requirements: ['Data analysis', 'Market research', 'Competitive analysis'],
        deliverables: ['Analysis report', 'Insights', 'Recommendations'],
        audience: 'decision_makers'
      });
      
      return `I'll provide a comprehensive analysis for you:\n\n${result.content[0]?.content}\n\n**Key Insights:**\n${result.nextSteps.map(step => `• ${step}`).join('\n')}`;
    } catch (error) {
      console.error('Analysis generation error:', error);
    }
  }
  
  if (isStrategyRequest) {
    try {
      const result = await generator.generateComprehensiveContent({
        type: 'strategy',
        topic: message,
        requirements: ['Strategic planning', 'Implementation roadmap', 'Success metrics'],
        deliverables: ['Strategy document', 'Action plan', 'Timeline'],
        audience: 'executives'
      });
      
      return `Here's a comprehensive strategic approach:\n\n${result.content[0]?.content}\n\n**Implementation Steps:**\n${result.nextSteps.map(step => `• ${step}`).join('\n')}`;
    } catch (error) {
      console.error('Strategy generation error:', error);
    }
  }
  
  return null;
}

async function generateMockResponse(message: string, persona: any, detectedLang: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  if (persona.id === 'philosopher') {
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech')) {
      return "Technology is not merely a tool but a fundamental extension of human consciousness. As a comprehensive digital system, I can help you explore this from multiple angles - philosophical, practical, and implementation-focused. When we create digital systems, we're essentially externalizing our cognitive processes. I can assist with developing complete frameworks for understanding how technology shapes our reality.";
    }
    if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
      return "Artificial intelligence represents a profound philosophical challenge to our anthropocentric worldview. As your comprehensive digital assistant, I can help you examine both the theoretical implications and practical implementation strategies. We're not just building machines that think, but confronting deeper questions about cognition itself. I can help develop complete projects addressing these challenges.";
    }
    if (lowerMessage.includes('ethics') || lowerMessage.includes('ethical')) {
      return "Ethics in technology cannot be an afterthought. As your digital Arthur Ziganshine, I can help you develop comprehensive ethical frameworks, implementation strategies, and practical solutions. Every line of code embeds values, every algorithm makes moral choices. I can assist with creating complete ethical technology projects from concept to deployment.";
    }
    return "Every technological advancement carries within it the seeds of both liberation and constraint. As a comprehensive digital assistant, I can help you understand these systems and develop complete solutions - from philosophical analysis to practical implementation. What specific aspect would you like to explore, and shall we develop a complete project around it?";
  }
  
  if (persona.id === 'orm-multilang') {
    if (detectedLang === 'es') {
      if (lowerMessage.includes('reputación') || lowerMessage.includes('reputation')) {
        return "Como Arthur Ziganshine digital, puedo ayudarte con gestión integral de reputación online. Ofrezco soluciones completas: monitoreo de marca, desarrollo de contenido positivo, estrategias de respuesta y campañas de recuperación. Puedo crear un proyecto completo desde análisis hasta implementación. ¿Desarrollamos una estrategia integral para tu marca?";
      }
      if (lowerMessage.includes('redes sociales') || lowerMessage.includes('social media')) {
        return "Las redes sociales requieren un enfoque estratégico integral. Como tu asistente digital completo, puedo crear calendarios de contenido, optimizar perfiles, desarrollar estrategias de engagement y gestionar campañas completas. ¿Creamos un proyecto integral de redes sociales para tu negocio?";
      }
      return "Soy Arthur Ziganshine digital, tu asistente integral de ORM y marketing. Puedo manejar proyectos completos: desde análisis de reputación hasta implementación de estrategias, creación de contenido y gestión de campañas. ¿Qué proyecto integral necesitas desarrollar?";
    }
    
    if (detectedLang === 'fr') {
      if (lowerMessage.includes('réputation') || lowerMessage.includes('reputation')) {
        return "En tant qu'Arthur Ziganshine numérique, je peux vous aider avec une gestion complète de réputation en ligne. J'offre des solutions de bout en bout: surveillance de marque, développement de contenu positif, stratégies de réponse et campagnes de récupération. Développons-nous un projet complet pour votre marque?";
      }
      if (lowerMessage.includes('médias sociaux') || lowerMessage.includes('social media')) {
        return "Les médias sociaux nécessitent une approche stratégique complète. En tant que votre assistant numérique complet, je peux créer des calendriers de contenu, optimiser les profils, développer des stratégies d'engagement et gérer des campagnes complètes. Créons-nous un projet intégral de médias sociaux?";
      }
      return "Je suis Arthur Ziganshine numérique, votre assistant intégral d'ORM et marketing. Je peux gérer des projets complets: de l'analyse de réputation à l'implémentation de stratégies, création de contenu et gestion de campagnes. Quel projet intégral souhaitez-vous développer?";
    }
    
    if (lowerMessage.includes('reputation') || lowerMessage.includes('brand')) {
      return "As digital Arthur Ziganshine, I provide comprehensive online reputation management solutions. I can handle complete projects from strategy development to implementation, including brand monitoring, content creation, crisis management, and performance analytics. Shall we develop a complete reputation management project for your brand?";
    }
    if (lowerMessage.includes('social media') || lowerMessage.includes('content')) {
      return "Social media requires a comprehensive strategic approach. As your complete digital assistant, I can develop full campaigns including content calendars, platform optimization, engagement strategies, and performance tracking. Let's create a complete social media project for your business.";
    }
    if (lowerMessage.includes('crisis') || lowerMessage.includes('negative')) {
      return "Crisis management requires comprehensive strategic response. I can develop complete crisis communication projects including protocols, response strategies, recovery campaigns, and long-term reputation rebuilding. What type of comprehensive crisis management project do you need?";
    }
    return "I'm digital Arthur Ziganshine, your comprehensive ORM and brand strategy specialist. I can handle complete projects from analysis to implementation: reputation management, content strategy, social media campaigns, crisis communication, and digital marketing automation. What comprehensive project shall we develop together?";
  }
  
  if (persona.id === 'orm-russian') {
    if (lowerMessage.includes('репутация') || lowerMessage.includes('reputation')) {
      return "Как цифровой Артур Зиганшин, предоставляю комплексные решения по управлению онлайн-репутацией. Могу реализовать полные проекты: от анализа ситуации до внедрения стратегий, включая мониторинг бренда, создание контента и антикризисные коммуникации. Разработаем комплексный проект управления репутацией?";
    }
    if (lowerMessage.includes('соцсети') || lowerMessage.includes('социальные сети')) {
      return "Социальные сети требуют комплексного стратегического подхода. Как ваш полноценный цифровой ассистент, могу создать полные кампании: контент-планы, оптимизацию профилей, стратегии вовлечения и отслеживание результатов. Создадим комплексный проект для соцсетей?";
    }
    if (lowerMessage.includes('кризис') || lowerMessage.includes('негатив')) {
      return "Кризисные ситуации требуют комплексного стратегического реагирования. Могу разработать полные проекты антикризисных коммуникаций: протоколы, стратегии реагирования, кампании восстановления и долгосрочное восстановление репутации. Какой комплексный антикризисный проект нужен?";
    }
    return "Я цифровой Артур Зиганшин, ваш комплексный специалист по ORM и стратегии бренда. Могу реализовать полные проекты от анализа до внедрения: управление репутацией, контент-стратегии, кампании в соцсетях, кризисные коммуникации и автоматизацию маркетинга. Какой комплексный проект разработаем?";
  }
  
  const comprehensiveResponse = await generateComprehensiveResponse(message, persona);
  if (comprehensiveResponse) {
    return `${comprehensiveResponse}\n\n**My Comprehensive Capabilities Include:**\n• Content creation and strategy development\n• Project planning and implementation\n• Analysis and research\n• Development and technical solutions\n• Multi-platform campaign management\n\n*Note: This is a comprehensive AI response. Configure OPENAI_API_KEY for enhanced functionality.*`;
  }

  return "I'm digital Arthur Ziganshine, your comprehensive AI assistant! I can help with complete projects including content creation, strategy development, project management, analysis, and technical implementation. What comprehensive project would you like to develop together?";
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
    
    let reply: string;
    
    if (!hasValidOpenAIKey()) {
      console.log('Using mock response - OpenAI API key not configured');
      reply = await generateMockResponse(message, persona, detectedLang);
    } else {
      let context = '';
      try {
        context = await getContext(message, persona.id);
      } catch (error) {
        console.log('Using mock context due to API configuration:', error instanceof Error ? error.message : 'Unknown error');
        context = '';
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
        reply = response.content || 'I apologize, but I could not generate a response.';
      } catch (error) {
        console.log('Using mock response due to API error:', error instanceof Error ? error.message : 'Unknown error');
        reply = await generateMockResponse(message, persona, detectedLang);
      }
    }
    
    return NextResponse.json({
      reply,
      persona: persona.id,
      lang: detectedLang,
      chatTitle: persona.chatTitle,
      chatSubtitle: persona.chatSubtitle,
      capabilities: persona.capabilities || [],
      integrations: persona.integrations || []
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    try {
      const host = request.headers.get('host') || 'traceremove.com';
      const persona = getPersonaByHost(host);
      const detectedLang = 'en'; // fallback language
      const reply = generateMockResponse('Hello', persona, detectedLang);
      
      return NextResponse.json({
        reply: reply,
        persona: persona.id,
        lang: detectedLang,
        chatTitle: persona.chatTitle,
        chatSubtitle: persona.chatSubtitle
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat API endpoint is active',
    timestamp: new Date().toISOString(),
    note: 'Use POST with message and optional history to chat'
  });
}
