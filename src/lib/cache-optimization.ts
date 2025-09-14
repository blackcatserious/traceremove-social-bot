import { getCachedSearchResults, cacheSearchResults, getCachedQueryResult, cacheQueryResult } from './cache-advanced';
import { getSystemMetrics } from './monitoring';

interface CachePattern {
  key: string;
  frequency: number;
  lastAccess: Date;
  hitRate: number;
  avgResponseTime: number;
}

interface CacheRecommendation {
  type: 'warm' | 'evict' | 'optimize';
  key: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

class CacheOptimizer {
  private patterns: Map<string, CachePattern> = new Map();
  private readonly PATTERN_WINDOW = 24 * 60 * 60 * 1000;
  private readonly MIN_FREQUENCY_THRESHOLD = 5;
  private readonly LOW_HIT_RATE_THRESHOLD = 0.3;

  recordCacheAccess(key: string, hit: boolean, responseTime: number) {
    const pattern = this.patterns.get(key) || {
      key,
      frequency: 0,
      lastAccess: new Date(),
      hitRate: 0,
      avgResponseTime: 0
    };

    pattern.frequency += 1;
    pattern.lastAccess = new Date();
    pattern.hitRate = hit ? 
      (pattern.hitRate * (pattern.frequency - 1) + 1) / pattern.frequency :
      (pattern.hitRate * (pattern.frequency - 1)) / pattern.frequency;
    pattern.avgResponseTime = (pattern.avgResponseTime * (pattern.frequency - 1) + responseTime) / pattern.frequency;

    this.patterns.set(key, pattern);
  }

  async generateRecommendations(): Promise<CacheRecommendation[]> {
    const recommendations: CacheRecommendation[] = [];
    const now = new Date();

    for (const [key, pattern] of this.patterns.entries()) {
      const ageHours = (now.getTime() - pattern.lastAccess.getTime()) / (1000 * 60 * 60);

      if (pattern.frequency >= this.MIN_FREQUENCY_THRESHOLD && pattern.hitRate < this.LOW_HIT_RATE_THRESHOLD) {
        recommendations.push({
          type: 'warm',
          key,
          reason: `High frequency (${pattern.frequency}) but low hit rate (${(pattern.hitRate * 100).toFixed(1)}%)`,
          priority: 'high',
          estimatedImpact: `Could reduce response time by ${Math.round(pattern.avgResponseTime * 0.8)}ms`
        });
      }

      if (ageHours > 24 && pattern.frequency < 2) {
        recommendations.push({
          type: 'evict',
          key,
          reason: `Low usage (${pattern.frequency} accesses) and stale (${Math.round(ageHours)}h old)`,
          priority: 'medium',
          estimatedImpact: 'Free up cache memory for more active data'
        });
      }

      if (pattern.avgResponseTime > 2000 && pattern.frequency > 10) {
        recommendations.push({
          type: 'optimize',
          key,
          reason: `High response time (${Math.round(pattern.avgResponseTime)}ms) with frequent access`,
          priority: 'high',
          estimatedImpact: 'Consider query optimization or data structure improvements'
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async warmCache(keys: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const key of keys) {
      try {
        if (key.startsWith('search_')) {
          const searchParams = this.parseSearchKey(key);
          if (searchParams) {
            await this.warmSearchCache(searchParams);
            success++;
          }
        } else if (key.startsWith('query_')) {
          await this.warmQueryCache(key);
          success++;
        }
      } catch (error) {
        console.error(`Failed to warm cache for key ${key}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  private parseSearchKey(key: string): { query: string; persona: string } | null {
    try {
      const decoded = Buffer.from(key.replace('search_', ''), 'base64').toString();
      const params = JSON.parse(decoded);
      return {
        query: params.filter?.keywords?.join(' ') || '',
        persona: params.filter?.visibility || 'public'
      };
    } catch {
      return null;
    }
  }

  private async warmSearchCache(params: { query: string; persona: string }) {
    console.log(`Warming search cache for query: ${params.query}, persona: ${params.persona}`);
  }

  private async warmQueryCache(key: string) {
    console.log(`Warming query cache for ${key}`);
  }

  getCacheStats(): {
    totalPatterns: number;
    avgHitRate: number;
    avgResponseTime: number;
    topPatterns: CachePattern[];
  } {
    const patterns = Array.from(this.patterns.values());
    
    return {
      totalPatterns: patterns.length,
      avgHitRate: patterns.reduce((sum, p) => sum + p.hitRate, 0) / patterns.length || 0,
      avgResponseTime: patterns.reduce((sum, p) => sum + p.avgResponseTime, 0) / patterns.length || 0,
      topPatterns: patterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
    };
  }

  async performMaintenance(): Promise<{
    evicted: number;
    warmed: number;
    optimized: number;
  }> {
    const recommendations = await this.generateRecommendations();
    
    const evictKeys = recommendations.filter(r => r.type === 'evict').map(r => r.key);
    const warmKeys = recommendations.filter(r => r.type === 'warm').map(r => r.key);
    const optimizeKeys = recommendations.filter(r => r.type === 'optimize').map(r => r.key);

    const warmResult = await this.warmCache(warmKeys);

    for (const key of evictKeys) {
      this.patterns.delete(key);
    }

    return {
      evicted: evictKeys.length,
      warmed: warmResult.success,
      optimized: optimizeKeys.length
    };
  }
}

export const cacheOptimizer = new CacheOptimizer();

export async function optimizeCache(): Promise<any> {
  const recommendations = await cacheOptimizer.generateRecommendations();
  const stats = cacheOptimizer.getCacheStats();
  const maintenance = await cacheOptimizer.performMaintenance();

  return {
    recommendations,
    stats,
    maintenance,
    timestamp: new Date().toISOString()
  };
}

export function recordCacheMetrics(key: string, hit: boolean, responseTime: number) {
  cacheOptimizer.recordCacheAccess(key, hit, responseTime);
}
