import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getContext } from '@/lib/rag';
import { generateResponse, pickModel } from '@/lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') || '';
    const persona = (request.nextUrl.searchParams.get('persona') || 'public') as 'public' | 'internal';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    
    if (!q.trim()) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }
    
    const sqlFilter = await buildSQLFilter(q, persona);
    const docs = await searchDocuments(sqlFilter, limit);
    const context = await getContext(q, 'search', 6, persona);
    const answer = await generateAnswer(q, context, persona);
    
    return NextResponse.json({
      query: q,
      persona,
      answer: answer.content,
      sources: extractSources(context),
      documents: docs,
      model: answer.model,
      provider: answer.provider,
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function buildSQLFilter(q: string, persona: 'public' | 'internal'): Promise<any> {
  const baseFilter = {
    visibility: persona,
    status: persona === 'public' ? ['published', 'active'] : undefined,
    lang: persona === 'public' ? ['en'] : undefined,
  };
  
  const keywords = q.toLowerCase().split(' ').filter(word => word.length > 2);
  
  return {
    ...baseFilter,
    keywords,
  };
}

async function searchDocuments(filter: any, limit: number): Promise<any[]> {
  try {
    const visibilityCondition = filter.visibility === 'public' 
      ? "visibility = 'public'" 
      : "visibility IN ('public', 'internal')";
    
    const statusCondition = filter.status 
      ? `AND status IN (${filter.status.map((s: string) => `'${s}'`).join(', ')})`
      : '';
    
    const langCondition = filter.lang 
      ? `AND lang IN (${filter.lang.map((l: string) => `'${l}'`).join(', ')})`
      : '';
    
    const keywordCondition = filter.keywords && filter.keywords.length > 0
      ? `AND (${filter.keywords.map((k: string) => 
          `(title ILIKE '%${k}%' OR summary ILIKE '%${k}%' OR content ILIKE '%${k}%')`
        ).join(' OR ')})`
      : '';
    
    const searchQuery = `
      SELECT 'catalog' as table_name, notion_id, title, summary, topic, tags, status, lang, url, updated_at
      FROM catalog 
      WHERE ${visibilityCondition} ${statusCondition} ${langCondition} ${keywordCondition}
      
      UNION ALL
      
      SELECT 'cases' as table_name, notion_id, name as title, terms as summary, status as topic, keys as tags, status, 'en' as lang, url, updated_at
      FROM cases 
      WHERE ${visibilityCondition} ${keywordCondition}
      
      UNION ALL
      
      SELECT 'publishing' as table_name, notion_id, title, notes as summary, type as topic, tags, submission_status as status, lang, url, updated_at
      FROM publishing 
      WHERE ${visibilityCondition} ${langCondition} ${keywordCondition}
      
      ${filter.visibility === 'internal' ? `
      UNION ALL
      
      SELECT 'finance' as table_name, notion_id, name as title, notes as summary, 'finance' as topic, ARRAY[]::text[] as tags, 'active' as status, 'en' as lang, null as url, updated_at
      FROM finance 
      WHERE ${keywordCondition}
      ` : ''}
      
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;
    
    const result = await query(searchQuery);
    return result.rows || [];
    
  } catch (error) {
    console.error('SQL search error:', error);
    return [];
  }
}

async function generateAnswer(q: string, context: string, persona: 'public' | 'internal'): Promise<any> {
  const modelConfig = pickModel({ 
    intent: 'qa', 
    length: q.length + context.length,
    persona: persona === 'public' ? 'philosopher' : 'orm-multilang'
  });
  
  const systemPrompt = `You are a helpful AI assistant for traceremove.net. 
  
  ${persona === 'public' 
    ? 'You have access to public information about AI research, philosophy of technology, and academic content. Focus on thoughtful, philosophical responses about technology and its implications.'
    : 'You have access to comprehensive information including business data, case studies, and internal documentation. Provide professional, detailed responses for reputation management and business inquiries.'
  }
  
  When answering:
  1. Use the provided context to give accurate, specific information
  2. Include 2-3 citations from the sources when possible
  3. If the context doesn't contain relevant information, say so clearly
  4. Keep responses focused and helpful
  5. ${persona === 'public' ? 'Maintain a thoughtful, academic tone' : 'Use a professional, business-oriented tone'}
  
  Context from knowledge base:
  ${context}`;
  
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: q }
  ];
  
  return await generateResponse(messages, modelConfig);
}

function extractSources(context: string): Array<{ title: string; table: string }> {
  const sources: Array<{ title: string; table: string }> = [];
  const sourceMatches = context.match(/Source: ([^(]+) \(([^)]+)\)/g);
  
  if (sourceMatches) {
    for (const match of sourceMatches) {
      const titleMatch = match.match(/Source: ([^(]+) \(([^)]+)\)/);
      if (titleMatch) {
        sources.push({
          title: titleMatch[1].trim(),
          table: titleMatch[2].trim(),
        });
      }
    }
  }
  
  return sources.slice(0, 3);
}
