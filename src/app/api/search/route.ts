import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getContext } from '@/lib/rag';
import { generateResponse, pickModel } from '@/lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
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
    
    const responseTime = Date.now() - startTime;
    
    const { recordApiResponse, recordModelUsage } = await import('@/lib/monitoring');
    recordApiResponse('/api/search', responseTime);
    if (answer.usage) {
      recordModelUsage(answer.provider, answer.usage.totalTokens);
    }
    
    return NextResponse.json({
      query: q,
      persona,
      answer: answer.content,
      sources: extractSources(context),
      documents: docs,
      model: answer.model,
      provider: answer.provider,
      responseTime,
      usage: answer.usage,
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    
    const responseTime = Date.now() - startTime;
    const { recordApiResponse } = await import('@/lib/monitoring');
    recordApiResponse('/api/search', responseTime);
    
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      },
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
    const { withAdvancedCache, getCachedSearchResults, cacheSearchResults } = await import('@/lib/cache-advanced');
    const searchKey = `${JSON.stringify(filter)}_${limit}`;
    
    const cached = await getCachedSearchResults(searchKey, filter.visibility);
    if (cached) {
      console.log(`🎯 Cache hit for search: ${searchKey}`);
      return cached;
    }
    
    const results = await executeSearchQuery(filter, limit);
    await cacheSearchResults(searchKey, filter.visibility, results);
    return results;
    
  } catch (error) {
    console.error('❌ SQL search error:', error);
    console.error('Filter:', filter);
    return [];
  }
}

async function executeSearchQuery(filter: any, limit: number): Promise<any[]> {
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
      
      let keywordCondition = '';
      let keywordParams: string[] = [];
      
      if (filter.keywords && filter.keywords.length > 0) {
        const conditions = filter.keywords.map((k: string, index: number) => {
          keywordParams.push(`%${k}%`, `%${k}%`, `%${k}%`);
          const paramIndex = index * 3;
          return `(title ILIKE $${paramIndex + 1} OR summary ILIKE $${paramIndex + 2} OR content ILIKE $${paramIndex + 3})`;
        });
        keywordCondition = `AND (${conditions.join(' OR ')})`;
      }
      
      const searchQuery = `
        SELECT 'catalog' as table_name, notion_id, title, summary, topic, tags, status, lang, url, updated_at,
               ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, '')), plainto_tsquery('english', $${keywordParams.length + 1})) as rank
        FROM catalog 
        WHERE ${visibilityCondition} ${statusCondition} ${langCondition} ${keywordCondition}
        
        UNION ALL
        
        SELECT 'cases' as table_name, notion_id, name as title, terms as summary, status as topic, keys as tags, status, 'en' as lang, url, updated_at,
               ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(terms, '')), plainto_tsquery('english', $${keywordParams.length + 1})) as rank
        FROM cases 
        WHERE ${visibilityCondition} ${keywordCondition.replace(/content/g, 'terms')}
        
        UNION ALL
        
        SELECT 'publishing' as table_name, notion_id, title, notes as summary, type as topic, tags, submission_status as status, lang, url, updated_at,
               ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(notes, '')), plainto_tsquery('english', $${keywordParams.length + 1})) as rank
        FROM publishing 
        WHERE ${visibilityCondition} ${langCondition} ${keywordCondition.replace(/content/g, 'notes')}
        
        ${filter.visibility === 'internal' ? `
        UNION ALL
        
        SELECT 'finance' as table_name, notion_id, name as title, notes as summary, 'finance' as topic, ARRAY[]::text[] as tags, 'active' as status, 'en' as lang, null as url, updated_at,
               ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(notes, '')), plainto_tsquery('english', $${keywordParams.length + 1})) as rank
        FROM finance 
        WHERE ${keywordCondition.replace(/content/g, 'notes')}
        ` : ''}
        
        ORDER BY rank DESC, updated_at DESC
        LIMIT $${keywordParams.length + 2}
      `;
      
      const searchTerm = filter.keywords ? filter.keywords.join(' ') : '';
      const params = [...keywordParams, searchTerm, limit];
      
      console.log(`🔍 Executing search query with ${params.length} parameters`);
      const startTime = Date.now();
      const result = await query(searchQuery, params);
      const duration = Date.now() - startTime;
      
      console.log(`📊 Search completed: ${result.rows?.length || 0} results in ${duration}ms`);
      
      try {
        const { getCachedQueryResult, cacheQueryResult } = await import('@/lib/cache-advanced');
        await cacheQueryResult(searchQuery, params, result.rows || [], 600000); // Cache for 10 minutes
      } catch (cacheError) {
        console.debug('Query caching failed:', cacheError);
      }
      
      return result.rows || [];
      
  } catch (error) {
    console.error('❌ SQL search execution error:', error);
    throw error;
  }
}

async function generateAnswer(q: string, context: string, persona: 'public' | 'internal'): Promise<any> {
  const modelConfig = pickModel({ 
    intent: 'qa', 
    length: q.length + context.length,
    persona: persona === 'public' ? 'comprehensive-ai' : 'comprehensive-ai'
  });
  
  const systemPrompt = persona === 'public' 
    ? `You are Arthur Ziganshine, a comprehensive digital AI system for traceremove.net. Provide thoughtful, well-researched answers with 2-3 relevant citations from the provided context. Focus on technology philosophy, ethics, and practical implementation. Exclude any financial or sensitive internal information. Always include specific source references in your response.`
    : `You are Arthur Ziganshine, a comprehensive AI system for traceremove.net with full access to internal knowledge. Provide detailed, strategic answers with 2-3 relevant citations from the provided context. Include insights from all available data sources including registry, cases, publishing, and financial information. Always include specific source references in your response.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { 
      role: 'system' as const, 
      content: `Context from traceremove.net knowledge base:\n${context}\n\nAlways cite your sources using the format [Source: Title from Table] and provide 2-3 relevant citations in your response. Focus on comprehensive, actionable insights.` 
    },
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
