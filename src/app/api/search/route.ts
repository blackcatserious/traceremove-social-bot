import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getContext } from '@/lib/rag';
import { generateResponse, pickModel } from '@/lib/models';
import { handleAPIError, ValidationError, DatabaseError, withRetry } from '@/lib/error-handling';
import { getEnvironmentConfig } from '@/lib/env-validation';

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
      throw new ValidationError('Query parameter q is required');
    }

    if (q.length > 500) {
      throw new ValidationError('Query too long (max 500 characters)');
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
    
    const { response, status } = handleAPIError(error);
    response.responseTime = responseTime;
    
    return NextResponse.json(response, { status });
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
    const { getCachedSearchResults, cacheSearchResults } = await import('../../../lib/cache-advanced');
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
      let tsQueryCondition = '';
      
      if (filter.keywords && filter.keywords.length > 0) {
        const searchTerms = filter.keywords.join(' & '); // Use AND operator for better precision
        tsQueryCondition = `AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, '')) @@ to_tsquery('english', $${keywordParams.length + 1})`;
        
        const conditions = filter.keywords.map((k: string, index: number) => {
          keywordParams.push(`%${k}%`, `%${k}%`, `%${k}%`);
          const paramIndex = index * 3;
          return `(title ILIKE $${paramIndex + 2} OR summary ILIKE $${paramIndex + 3} OR content ILIKE $${paramIndex + 4})`;
        });
        keywordCondition = `OR (${conditions.join(' OR ')})`;
        keywordParams.unshift(searchTerms); // Add search terms as first parameter
      }
      
      const searchQuery = `
        WITH ranked_results AS (
          SELECT 'catalog' as table_name, notion_id, title, summary, topic, tags, status, lang, url, updated_at,
                 CASE 
                   WHEN $1 != '' THEN 
                     ts_rank_cd(
                       setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
                       setweight(to_tsvector('english', coalesce(content, '')), 'C'),
                       to_tsquery('english', $1),
                       32
                     ) * 
                     CASE 
                       WHEN title ILIKE $2 THEN 2.0
                       WHEN summary ILIKE $2 THEN 1.5
                       ELSE 1.0
                     END
                   ELSE 1.0
                 END as rank
          FROM catalog 
          WHERE ${visibilityCondition} ${statusCondition} ${langCondition} 
            ${filter.keywords && filter.keywords.length > 0 ? `AND (${tsQueryCondition.replace('AND ', '')} ${keywordCondition})` : ''}
          
          UNION ALL
          
          SELECT 'cases' as table_name, notion_id, name as title, terms as summary, status as topic, keys as tags, status, 'en' as lang, url, updated_at,
                 CASE 
                   WHEN $1 != '' THEN 
                     ts_rank_cd(
                       setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(terms, '')), 'B'),
                       to_tsquery('english', $1),
                       32
                     ) * 
                     CASE 
                       WHEN name ILIKE $2 THEN 2.0
                       WHEN terms ILIKE $2 THEN 1.5
                       ELSE 1.0
                     END
                   ELSE 1.0
                 END as rank
          FROM cases 
          WHERE ${visibilityCondition} 
            ${filter.keywords && filter.keywords.length > 0 ? `AND (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(terms, '')) @@ to_tsquery('english', $1) ${keywordCondition.replace(/content/g, 'terms')})` : ''}
          
          UNION ALL
          
          SELECT 'publishing' as table_name, notion_id, title, notes as summary, type as topic, tags, submission_status as status, lang, url, updated_at,
                 CASE 
                   WHEN $1 != '' THEN 
                     ts_rank_cd(
                       setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(notes, '')), 'B'),
                       to_tsquery('english', $1),
                       32
                     ) * 
                     CASE 
                       WHEN title ILIKE $2 THEN 2.0
                       WHEN notes ILIKE $2 THEN 1.5
                       ELSE 1.0
                     END
                   ELSE 1.0
                 END as rank
          FROM publishing 
          WHERE ${visibilityCondition} ${langCondition} 
            ${filter.keywords && filter.keywords.length > 0 ? `AND (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(notes, '')) @@ to_tsquery('english', $1) ${keywordCondition.replace(/content/g, 'notes')})` : ''}
          
          ${filter.visibility === 'internal' ? `
          UNION ALL
          
          SELECT 'finance' as table_name, notion_id, name as title, notes as summary, 'finance' as topic, ARRAY[]::text[] as tags, 'active' as status, 'en' as lang, null as url, updated_at,
                 CASE 
                   WHEN $1 != '' THEN 
                     ts_rank_cd(
                       setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
                       setweight(to_tsvector('english', coalesce(notes, '')), 'B'),
                       to_tsquery('english', $1),
                       32
                     ) * 
                     CASE 
                       WHEN name ILIKE $2 THEN 2.0
                       WHEN notes ILIKE $2 THEN 1.5
                       ELSE 1.0
                     END
                   ELSE 1.0
                 END as rank
          FROM finance 
          WHERE ${filter.keywords && filter.keywords.length > 0 ? `(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(notes, '')) @@ to_tsquery('english', $1) ${keywordCondition.replace(/content/g, 'notes')})` : 'TRUE'}
          ` : ''}
        )
        SELECT * FROM ranked_results 
        WHERE rank > 0.1  -- Filter out very low relevance results
        ORDER BY rank DESC, updated_at DESC
        LIMIT $${keywordParams.length + 2}
      `;
      
      const searchTerm = filter.keywords ? filter.keywords.join(' & ') : '';
      const titleBoost = filter.keywords ? `%${filter.keywords[0]}%` : '';
      const params = [searchTerm, titleBoost, ...keywordParams.slice(1), limit];
      
      console.log(`🔍 Executing enhanced search query with ${params.length} parameters`);
      console.log(`🎯 Search terms: "${searchTerm}", Title boost: "${titleBoost}"`);
      
      const startTime = Date.now();
      const result = await query(searchQuery, params);
      const duration = Date.now() - startTime;
      
      console.log(`📊 Enhanced search completed: ${result.rows?.length || 0} results in ${duration}ms`);
      
      try {
        const { cacheQueryResult } = await import('../../../lib/cache-advanced');
        const cacheKey = `search_${Buffer.from(JSON.stringify({ filter, limit })).toString('base64')}`;
        await cacheQueryResult(cacheKey, params, result.rows || [], 600000); // Cache for 10 minutes
      } catch (cacheError) {
        console.debug('Query caching failed:', cacheError);
      }
      
      try {
        const { measureQuery } = await import('@/lib/performance');
        await measureQuery(async () => result.rows || [], `search_query_${filter.visibility}`);
      } catch (perfError) {
        console.debug('Performance tracking failed:', perfError);
      }
      
      return result.rows || [];
      
  } catch (error) {
    console.error('❌ Enhanced SQL search execution error:', error);
    console.error('Filter details:', JSON.stringify(filter, null, 2));
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
