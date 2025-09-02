export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  timestamp: string;
}

export interface QueryPerformance {
  query: string;
  duration: number;
  rows: number;
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private queryMetrics: QueryPerformance[] = [];
  private maxMetrics = 1000;

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  recordQuery(query: QueryPerformance): void {
    this.queryMetrics.push(query);
    if (this.queryMetrics.length > this.maxMetrics) {
      this.queryMetrics.shift();
    }
  }

  getAverageResponseTime(minutes: number = 5): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => new Date(m.timestamp) > cutoff);
    
    if (recentMetrics.length === 0) return 0;
    
    return recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
  }

  getSlowestQueries(limit: number = 10): QueryPerformance[] {
    return [...this.queryMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getMetricsSummary(): {
    avgResponseTime: number;
    avgMemoryUsage: number;
    totalQueries: number;
    slowQueries: number;
  } {
    const avgResponseTime = this.getAverageResponseTime();
    const avgMemoryUsage = this.metrics.length > 0 
      ? this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length 
      : 0;
    
    const slowQueries = this.queryMetrics.filter(q => q.duration > 1000).length;
    
    return {
      avgResponseTime,
      avgMemoryUsage,
      totalQueries: this.queryMetrics.length,
      slowQueries,
    };
  }

  clearOldMetrics(hours: number = 24): void {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => new Date(m.timestamp) > cutoff);
    this.queryMetrics = this.queryMetrics.filter(q => new Date(q.timestamp) > cutoff);
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function measurePerformance<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    try {
      const result = await fn();
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      performanceMonitor.recordMetric({
        responseTime: endTime - startTime,
        memoryUsage: (endMemory - startMemory) / 1024 / 1024,
        timestamp: new Date().toISOString(),
      });
      
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

export function measureQuery<T>(
  fn: () => Promise<T>,
  queryText: string
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      performanceMonitor.recordQuery({
        query: queryText.substring(0, 100),
        duration,
        rows: Array.isArray(result) ? result.length : 1,
        timestamp: new Date().toISOString(),
      });
      
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
