import { NextRequest, NextResponse } from 'next/server';
import { PERSONAS, getPersonaByHost } from '@/lib/bot.config';
import { reindexPersona } from '@/lib/rag';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function getPersonaByKey(key: string) {
  const entries = Object.entries(PERSONAS);
  const found = entries.find(([, persona]) => persona.id === key) || 
                entries.find(([host]) => host === key);
  return found ? found[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const personaKey = url.searchParams.get('persona') || '';
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_TOKEN;
    
    if (adminToken && token !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const persona = getPersonaByKey(personaKey);
    if (!persona) {
      return NextResponse.json({ 
        error: 'Unknown persona',
        available: Object.values(PERSONAS).map(p => p.id)
      }, { status: 400 });
    }

    console.log(`Starting reindex for persona: ${persona.id}`);
    const count = await reindexPersona(persona.id, persona.notionDbId, persona.sitemapUrl);
    
    return NextResponse.json({ 
      ok: true, 
      persona: persona.id, 
      indexed: count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Reindex error:', error);
    return NextResponse.json(
      { 
        error: 'Reindex failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin reindex API endpoint',
    usage: 'POST with ?persona=<key> and Authorization: Bearer <ADMIN_TOKEN>',
    available_personas: Object.values(PERSONAS).map(p => ({
      id: p.id,
      domain: p.domain,
      notionDbId: p.notionDbId
    }))
  });
}
