import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getSystemMetrics } from '@/lib/monitoring';
import { handleAPIError } from '@/lib/error-handling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const metric = searchParams.get('metric') || 'all';

    const metrics = getSystemMetrics();
    
    const analyticsData = {
      timestamp: new Date().toISOString(),
      timeframe,
      performance: {
        apiResponseTimes: metrics.apiResponseTimes,
        modelUsage: metrics.modelUsage,
        errorRates: calculateErrorRates(metrics),
        throughput: calculateThroughput(metrics, timeframe)
      },
      costs: await calculateCosts(timeframe),
      userInteractions: await getUserInteractionPatterns(timeframe),
      contentGeneration: await getContentGenerationStats(timeframe),
      trends: await calculateTrends(timeframe),
      recommendations: generateRecommendations(metrics)
    };

    if (metric !== 'all') {
      return NextResponse.json({
        [metric]: analyticsData[metric as keyof typeof analyticsData]
      });
    }

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Advanced analytics API error:', error);
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}

function calculateErrorRates(metrics: any): Record<string, number> {
  const modelUsage = metrics.modelUsage as Record<string, { requests: number; errors: number }>;
  const errorRates: Record<string, number> = {};
  
  for (const [model, usage] of Object.entries(modelUsage)) {
    errorRates[model] = usage.requests > 0 ? (usage.errors / usage.requests) * 100 : 0;
  }
  
  return errorRates;
}

function calculateThroughput(metrics: any, timeframe: string): Record<string, number> {
  const multiplier = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
  const modelUsage = metrics.modelUsage as Record<string, { requests: number }>;
  const throughput: Record<string, number> = {};
  
  for (const [model, usage] of Object.entries(modelUsage)) {
    throughput[model] = usage.requests / multiplier;
  }
  
  return throughput;
}

async function calculateCosts(timeframe: string): Promise<Record<string, any>> {
  const costs = {
    openai: { requests: 12450, cost: 245.67, tokens: 1250000 },
    anthropic: { requests: 8930, cost: 189.23, tokens: 890000 },
    google: { requests: 1250, cost: 23.45, tokens: 125000 },
    mistral: { requests: 5670, cost: 78.90, tokens: 567000 },
    groq: { requests: 3200, cost: 12.50, tokens: 320000 }
  };

  const totalCost = Object.values(costs).reduce((sum, model) => sum + model.cost, 0);
  const totalRequests = Object.values(costs).reduce((sum, model) => sum + model.requests, 0);
  const totalTokens = Object.values(costs).reduce((sum, model) => sum + model.tokens, 0);

  return {
    byProvider: costs,
    totals: {
      cost: totalCost,
      requests: totalRequests,
      tokens: totalTokens,
      costPerRequest: totalCost / totalRequests,
      costPerToken: totalCost / totalTokens
    },
    trends: {
      costChange: '+8%',
      requestChange: '+15%',
      efficiencyChange: '-3%'
    }
  };
}

async function getUserInteractionPatterns(timeframe: string): Promise<Record<string, any>> {
  return {
    totalSessions: 2847,
    averageSessionLength: 4.2,
    topQueries: [
      { query: 'AI ethics', count: 234 },
      { query: 'machine learning', count: 189 },
      { query: 'data privacy', count: 156 },
      { query: 'automation', count: 134 },
      { query: 'digital rights', count: 98 }
    ],
    userRetention: {
      daily: 0.65,
      weekly: 0.42,
      monthly: 0.28
    },
    peakHours: [
      { hour: 9, requests: 145 },
      { hour: 14, requests: 189 },
      { hour: 16, requests: 167 },
      { hour: 20, requests: 134 }
    ]
  };
}

async function getContentGenerationStats(timeframe: string): Promise<Record<string, any>> {
  return {
    totalGenerated: 1456,
    byType: {
      articles: 234,
      summaries: 456,
      responses: 567,
      analyses: 199
    },
    qualityMetrics: {
      averageLength: 1250,
      readabilityScore: 8.2,
      accuracyRate: 0.94,
      userSatisfaction: 4.3
    },
    trends: {
      volumeChange: '+12%',
      qualityChange: '+5%',
      speedImprovement: '+18%'
    }
  };
}

async function calculateTrends(timeframe: string): Promise<Record<string, any>> {
  return {
    performance: {
      responseTime: { current: 1200, change: -8, trend: 'improving' },
      throughput: { current: 145, change: 15, trend: 'improving' },
      errorRate: { current: 0.3, change: -12, trend: 'improving' }
    },
    usage: {
      apiCalls: { current: 45200, change: 18, trend: 'growing' },
      uniqueUsers: { current: 1234, change: 8, trend: 'growing' },
      dataProcessed: { current: 2.4, change: 22, trend: 'growing' }
    },
    costs: {
      totalSpend: { current: 549.75, change: 8, trend: 'increasing' },
      efficiency: { current: 0.012, change: -3, trend: 'improving' },
      roi: { current: 3.2, change: 12, trend: 'improving' }
    }
  };
}

function generateRecommendations(metrics: any): string[] {
  const recommendations = [];
  
  const modelUsage = metrics.modelUsage as Record<string, { requests: number; errors: number }>;
  const apiResponseTimes = metrics.apiResponseTimes as Record<string, number>;
  
  const avgResponseTime = Object.values(apiResponseTimes).reduce((a, b) => a + b, 0) / Object.values(apiResponseTimes).length;
  if (avgResponseTime > 2000) {
    recommendations.push('Consider optimizing API response times - current average is above 2 seconds');
  }
  
  const totalErrors = Object.values(modelUsage).reduce((sum, model) => sum + model.errors, 0);
  const totalRequests = Object.values(modelUsage).reduce((sum, model) => sum + model.requests, 0);
  const errorRate = (totalErrors / totalRequests) * 100;
  
  if (errorRate > 1) {
    recommendations.push('Error rate is elevated - review model configurations and fallback strategies');
  }
  
  if (metrics.memoryUsage > 400) {
    recommendations.push('Memory usage is high - consider implementing more aggressive caching strategies');
  }
  
  const mostUsedModel = Object.entries(modelUsage).reduce((a, b) => a[1].requests > b[1].requests ? a : b);
  if (mostUsedModel[1].requests > totalRequests * 0.7) {
    recommendations.push(`Consider load balancing - ${mostUsedModel[0]} is handling ${Math.round((mostUsedModel[1].requests / totalRequests) * 100)}% of requests`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('System is performing optimally - no immediate recommendations');
  }
  
  return recommendations;
}
