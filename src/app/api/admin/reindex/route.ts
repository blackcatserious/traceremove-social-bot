import { NextRequest, NextResponse } from 'next/server';
import { PERSONAS, getPersonaByHost } from '@/lib/bot.config';
import { reindexPersona } from '@/lib/rag';
import { fullSync, incrementalSync, NOTION_DATABASES } from '@/lib/etl';
import { initializeDatabase } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getPersonaByKey(key: string) {
  const entries = Object.entries(PERSONAS);
  const found = entries.find(([, persona]) => persona.id === key) || 
                entries.find(([host]) => host === key);
  return found ? found[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const personaKey = request.nextUrl.searchParams.get('persona') || '';
    const syncType = request.nextUrl.searchParams.get('type') || 'persona';
    const force = request.nextUrl.searchParams.get('force') === 'true';
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_TOKEN;
    
    if (adminToken && token !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (syncType === 'full') {
      console.log('Starting full ETL sync...');
      
      if (force) {
        await initializeDatabase();
      }
      
      const results = await fullSync();
      
      return NextResponse.json({
        ok: true,
        type: 'full_sync',
        results,
        timestamp: new Date().toISOString()
      });
    }
    
    if (syncType === 'incremental') {
      console.log('Starting incremental ETL sync...');
      const results = await incrementalSync();
      
      return NextResponse.json({
        ok: true,
        type: 'incremental_sync',
        results,
        timestamp: new Date().toISOString()
      });
    }
    
    if (syncType === 'database') {
      const dbName = request.nextUrl.searchParams.get('database');
      if (!dbName) {
        return NextResponse.json({ error: 'Database name required for database sync' }, { status: 400 });
      }
      
      const dbConfig = NOTION_DATABASES.find(db => db.name.toLowerCase() === dbName.toLowerCase());
      if (!dbConfig) {
        return NextResponse.json({ 
          error: 'Unknown database',
          available: NOTION_DATABASES.map(db => db.name)
        }, { status: 400 });
      }
      
      console.log(`Starting sync for ${dbConfig.name} database...`);
      const { syncDatabase } = await import('@/lib/etl');
      const result = await syncDatabase(dbConfig);
      
      return NextResponse.json({
        ok: true,
        type: 'database_sync',
        database: dbConfig.name,
        result,
        timestamp: new Date().toISOString()
      });
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
      type: 'persona_reindex',
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
    usage: {
      persona_reindex: 'POST with ?persona=<key>&type=persona and Authorization: Bearer <ADMIN_TOKEN>',
      full_sync: 'POST with ?type=full and Authorization: Bearer <ADMIN_TOKEN>',
      incremental_sync: 'POST with ?type=incremental and Authorization: Bearer <ADMIN_TOKEN>',
      database_sync: 'POST with ?type=database&database=<name> and Authorization: Bearer <ADMIN_TOKEN>'
    },
    available_personas: Object.values(PERSONAS).map(p => ({
      id: p.id,
      domain: p.domain,
      notionDbId: p.notionDbId
    })),
    available_databases: NOTION_DATABASES.map(db => ({
      name: db.name,
      table: db.table,
      visibility: db.visibility
    }))
  });
}
