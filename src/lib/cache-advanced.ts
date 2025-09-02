import { query } from './database';

export interface CacheEntry {
  key: string;
  value: any;
  expiry: number;
  hits: number;
  created: number;
  lastAccessed: number;
}

class AdvancedCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000;
  private defaultTTL = 300000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }
  
  set(key: string, value: any, ttl?: number): void {
    const now = Date.now();
    const expiry = now + (ttl || this.defaultTTL);
    
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      key,
      value,
      expiry,
      hits: 0,
      created: now,
      lastAccessed: now,
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    entry.lastAccessed = now;
    return entry.value;
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }
  
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; age: number; ttl: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.values()).map(entry => ({
      key: entry.key,
      hits: entry.hits,
      age: now - entry.created,
      ttl: entry.expiry - now,
    }));
    
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate = totalHits > 0 ? totalHits / entries.length : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      entries: entries.sort((a, b) => b.hits - a.hits).slice(0, 10), // Top 10 by hits
    };
  }
  
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

const advancedCache = new AdvancedCache();

export async function withAdvancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = advancedCache.get(key);
  if (cached !== null) {
    return cached;
  }
  
  const value = await fetcher();
  advancedCache.set(key, value, ttl);
  return value;
}

export function getCacheStats() {
  return advancedCache.getStats();
}

export function clearAdvancedCache() {
  advancedCache.clear();
}

export async function cacheSearchResults(
  query: string,
  persona: string,
  results: any[],
  ttl = 600000 // 10 minutes for search results
): Promise<void> {
  const key = `search:${persona}:${Buffer.from(query).toString('base64')}`;
  advancedCache.set(key, results, ttl);
}

export async function getCachedSearchResults(
  query: string,
  persona: string
): Promise<any[] | null> {
  const key = `search:${persona}:${Buffer.from(query).toString('base64')}`;
  return advancedCache.get(key);
}

export async function cacheQueryResult(
  sqlQuery: string,
  params: any[],
  result: any,
  ttl = 300000 // 5 minutes for DB queries
): Promise<void> {
  const key = `query:${Buffer.from(sqlQuery + JSON.stringify(params)).toString('base64')}`;
  advancedCache.set(key, result, ttl);
}

export async function getCachedQueryResult(
  sqlQuery: string,
  params: any[]
): Promise<any | null> {
  const key = `query:${Buffer.from(sqlQuery + JSON.stringify(params)).toString('base64')}`;
  return advancedCache.get(key);
}
