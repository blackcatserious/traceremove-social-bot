import { NextRequest, NextResponse } from 'next/server';
import { embedText, getVectorIndex } from '@/lib/rag';
import { query } from '@/lib/database';
import { generateResponse, pickModel } from '@/lib/models';
import { handleAPIError, ValidationError } from '@/lib/error-handling';
import { recordCacheMetrics } from '@/lib/cache-optimization';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const q = request.nextUrl.searchParams.get('q') || '';
    const persona = (request.nextUrl.searchParams.get('persona') || 'public') as 'public' | 'internal';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const threshold = parseFloat(request.nextUrl.searchParams.get('threshold') || '0.7');
    
    if (!q.trim()) {
      throw new ValidationError('Query parameter q is required');
    }

    if (q.length > 500) {
      throw new ValidationError('Query too long (max 500 characters)');
    }
    
    const cacheKey = `semantic_${Buffer.from(JSON.stringify({ q, persona, limit, threshold })).toString('base64')}`;
    
    try {
      const { getCachedSearchResults } = await import('@/lib/cache-advanced');
      const cached = await getCachedSearchResults(cacheKey, persona);
      if (cached) {
        recordCacheMetrics(cacheKey, true, Date.now() - startTime);
        return NextResponse.json({
          query: q,
          persona,
          results: cached,
          cached: true,
          responseTime: Date.now() - startTime
        });
      }
    } catch (cacheError) {
      console.debug('Cache lookup failed:', cacheError);
    }
    
    const queryEmbedding = await embedText(q);
    const semanticResults = await performSemanticSearch(queryEmbedding, persona, limit, threshold);
    const personalizedResults = await personalizeResults(semanticResults, q, persona);
    const facets = await generateFacets(semanticResults);
    
    try {
      const { cacheSearchResults } = await import('@/lib/cache-advanced');
      await cacheSearchResults(cacheKey, persona, personalizedResults, 600000);
    } catch (cacheError) {
      console.debug('Cache storage failed:', cacheError);
    }
    
    recordCacheMetrics(cacheKey, false, Date.now() - startTime);
    
    const responseTime = Date.now() - startTime;
    
    const { recordApiResponse } = await import('@/lib/monitoring');
    recordApiResponse('/api/search/semantic', responseTime);
    
    return NextResponse.json({
      query: q,
      persona,
      results: personalizedResults,
      facets,
      metadata: {
        totalResults: semanticResults.length,
        threshold,
        responseTime,
        cached: false
      }
    });
    
  } catch (error) {
    console.error('Semantic search API error:', error);
    
    const responseTime = Date.now() - startTime;
    const { recordApiResponse } = await import('@/lib/monitoring');
    recordApiResponse('/api/search/semantic', responseTime);
    
    const { response, status } = handleAPIError(error);
    response.responseTime = responseTime;
    
    return NextResponse.json(response, { status });
  }
}

async function performSemanticSearch(
  queryEmbedding: number[], 
  persona: 'public' | 'internal', 
  limit: number, 
  threshold: number
): Promise<any[]> {
  try {
    const vectorIndex = await getVectorIndex();
    
    const searchResults = await vectorIndex.query({
      vector: queryEmbedding,
      topK: limit * 2,
      filter: persona === 'public' ? 'visibility = "public"' : 'visibility = "public" OR visibility = "internal"',
      includeMetadata: true
    });
    
    return searchResults
      .filter((result: any) => result.score >= threshold)
      .slice(0, limit)
      .map((result: any) => ({
        id: result.id,
        score: result.score,
        metadata: result.payload,
        content: result.payload?.content || '',
        title: result.payload?.title || '',
        table: result.payload?.table || 'unknown'
      }));
      
  } catch (error) {
    console.error('Vector search failed:', error);
    return [];
  }
}

async function personalizeResults(results: any[], query: string, persona: string): Promise<any[]> {
  if (results.length === 0) return results;
  
  try {
    const modelConfig = pickModel({ 
      intent: 'analysis', 
      length: query.length,
      persona: 'comprehensive-ai'
    });
    
    const systemPrompt = `You are an AI system that personalizes search results. Given a query and search results, rerank them based on relevance and add personalized insights. Return the results in the same format but with enhanced descriptions and relevance scores.`;
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { 
        role: 'user' as const, 
        content: `Query: "${query}"\nPersona: ${persona}\nResults: ${JSON.stringify(results.slice(0, 5), null, 2)}\n\nPlease rerank these results and add brief personalized insights for each.` 
      }
    ];
    
    const response = await generateResponse(messages, modelConfig);
    
    try {
      const personalizedData = JSON.parse(response.content);
      if (Array.isArray(personalizedData)) {
        return personalizedData.map((item, index) => ({
          ...results[index],
          personalizedInsight: item.insight || '',
          adjustedScore: item.score || results[index].score
        }));
      }
    } catch (parseError) {
      console.debug('Failed to parse personalization response:', parseError);
    }
    
    return results.map(result => ({
      ...result,
      personalizedInsight: `Relevant to your query about "${query}"`,
      adjustedScore: result.score
    }));
    
  } catch (error) {
    console.error('Personalization failed:', error);
    return results;
  }
}

async function generateFacets(results: any[]): Promise<Record<string, any[]>> {
  const facets: Record<string, any[]> = {
    tables: [],
    topics: [],
    scores: []
  };
  
  const tableCounts: Record<string, number> = {};
  const topicCounts: Record<string, number> = {};
  const scoreRanges = { high: 0, medium: 0, low: 0 };
  
  for (const result of results) {
    tableCounts[result.table] = (tableCounts[result.table] || 0) + 1;
    
    if (result.metadata?.topic) {
      topicCounts[result.metadata.topic] = (topicCounts[result.metadata.topic] || 0) + 1;
    }
    
    if (result.score >= 0.8) scoreRanges.high++;
    else if (result.score >= 0.6) scoreRanges.medium++;
    else scoreRanges.low++;
  }
  
  facets.tables = Object.entries(tableCounts).map(([table, count]) => ({ table, count }));
  facets.topics = Object.entries(topicCounts).map(([topic, count]) => ({ topic, count }));
  facets.scores = [
    { range: 'high (0.8+)', count: scoreRanges.high },
    { range: 'medium (0.6-0.8)', count: scoreRanges.medium },
    { range: 'low (<0.6)', count: scoreRanges.low }
  ];
  
  return facets;
}
