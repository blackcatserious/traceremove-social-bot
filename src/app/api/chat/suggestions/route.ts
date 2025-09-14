import { NextRequest, NextResponse } from 'next/server';
import { getContext } from '@/lib/rag';
import { getPersonaByHost } from '@/lib/bot.config';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || query.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }
    
    const host = request.headers.get('host') || 'traceremove.com';
    const persona = getPersonaByHost(host);
    
    try {
      const context = await getContext(query, persona.id, 3);
      const suggestions = context.split('\n\n').map(chunk => {
        const titleMatch = chunk.match(/\[Source: (.*?) from/);
        const sourceMatch = chunk.match(/from (.*?)\]/);
        return {
          title: titleMatch ? titleMatch[1] : 'Knowledge Base',
          preview: chunk.substring(chunk.indexOf(']:') + 2, chunk.indexOf(']:') + 102).trim() + '...',
          relevance: 0.8,
          source: sourceMatch ? sourceMatch[1] : 'Knowledge Base'
        };
      }).filter(s => s.title !== 'Knowledge Base' || s.preview.length > 10).slice(0, 3);
      
      return NextResponse.json({ suggestions });
    } catch (error) {
      console.error('Context retrieval error:', error);
      
      const fallbackSuggestions = [
        {
          title: 'Project Planning',
          preview: 'Get help with comprehensive project planning, timelines, and resource allocation...',
          relevance: 0.6,
          source: 'Templates'
        },
        {
          title: 'Content Strategy',
          preview: 'Develop content creation strategies, campaigns, and multi-platform approaches...',
          relevance: 0.6,
          source: 'Templates'
        },
        {
          title: 'Technical Analysis',
          preview: 'Analyze systems, code, and technical solutions with detailed insights...',
          relevance: 0.6,
          source: 'Templates'
        }
      ];
      
      return NextResponse.json({ suggestions: fallbackSuggestions });
    }
  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
