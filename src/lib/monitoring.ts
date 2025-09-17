export interface SystemMetrics {
  timestamp: string;
  apiResponseTimes: Record<string, number>;
  databaseConnections: number;
  vectorIndexSize: number;
  notionSyncStatus: Record<string, { lastSync: string; recordCount: number; errors: number }>;
  modelUsage: Record<string, { requests: number; tokens: number; errors: number }>;
  memoryUsage: number;
  uptime: number;
  cacheStats?: {
    size: number;
    hitRate: number;
    maxSize: number;
  };
  queryPerformance?: {
    averageResponseTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  etlStatus?: {
    lastFullSync: string;
    lastIncrementalSync: string;
    totalRecords: number;
    syncErrors: number;
  };
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  lastCheck: string;
}

let metrics: SystemMetrics = {
  timestamp: new Date().toISOString(),
  apiResponseTimes: {},
  databaseConnections: 0,
  vectorIndexSize: 0,
  notionSyncStatus: {},
  modelUsage: {},
  memoryUsage: 0,
  uptime: 0,
};

let healthChecks: HealthCheck[] = [];

export function updateMetric(key: keyof SystemMetrics, value: any): void {
  (metrics as any)[key] = value;
  metrics.timestamp = new Date().toISOString();
}

export function recordApiResponse(endpoint: string, responseTime: number): void {
  metrics.apiResponseTimes[endpoint] = responseTime;
  metrics.timestamp = new Date().toISOString();
}

export function recordModelUsage(provider: string, tokens: number, error?: boolean): void {
  if (!metrics.modelUsage[provider]) {
    metrics.modelUsage[provider] = { requests: 0, tokens: 0, errors: 0 };
  }
  
  metrics.modelUsage[provider].requests++;
  metrics.modelUsage[provider].tokens += tokens;
  if (error) {
    metrics.modelUsage[provider].errors++;
  }
  
  metrics.timestamp = new Date().toISOString();
}

export function updateHealthCheck(service: string, status: HealthCheck['status'], responseTime?: number, error?: string): void {
  const existingIndex = healthChecks.findIndex(check => check.service === service);
  const healthCheck: HealthCheck = {
    service,
    status,
    responseTime,
    error,
    lastCheck: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    healthChecks[existingIndex] = healthCheck;
  } else {
    healthChecks.push(healthCheck);
  }
}

export function getSystemMetrics(): SystemMetrics {
  metrics.uptime = process.uptime();
  metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  
  try {
    const { getCacheStats } = require('./cache-advanced');
    const cacheStats = getCacheStats();
    metrics.cacheStats = {
      size: cacheStats.size,
      hitRate: cacheStats.hitRate,
      maxSize: cacheStats.maxSize,
    };
  } catch (error) {
    console.debug('Cache stats not available:', error);
  }
  
  try {
    const { getPerformanceStats } = require('./performance');
    const perfStats = getPerformanceStats();
    metrics.queryPerformance = {
      averageResponseTime: perfStats.averageQueryTime,
      slowQueries: perfStats.slowQueries,
      totalQueries: perfStats.totalQueries,
    };
  } catch (error) {
    console.debug('Performance stats not available:', error);
  }
  
  return { ...metrics };
}

export function getHealthChecks(): HealthCheck[] {
  return [...healthChecks];
}

export async function performHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];
  const healthCheckTimeout = 10000; // 10 second timeout for health checks
  
  // Helper function to run health check with timeout
  const runHealthCheck = async (name: string, checkFn: () => Promise<void>): Promise<HealthCheck> => {
    const startTime = Date.now();
    
    try {
      await Promise.race([
        checkFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), healthCheckTimeout)
        )
      ]);
      
      const responseTime = Date.now() - startTime;
      return {
        service: name,
        status: responseTime < 2000 ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        service: name,
        status: 'unhealthy',
        responseTime,
        error: errorMessage,
        lastCheck: new Date().toISOString(),
      };
    }
  };
  
  // PostgreSQL health check with connection pooling validation
  const pgCheck = await runHealthCheck('PostgreSQL', async () => {
    const { getPool } = await import('./database');
    const pool = getPool();
    
    // Test both basic connectivity and pool status
    const client = await pool.connect();
    try {
      await client.query('SELECT 1 as health_check');
      await client.query('SELECT version()'); // Additional check for database responsiveness
    } finally {
      client.release();
    }
    
    // Check pool stats if available (pg Pool has different properties)
    if (pool.totalCount !== undefined && pool.options?.max) {
      if (pool.totalCount > pool.options.max * 0.9) {
        throw new Error('Connection pool near capacity');
      }
    }
  });
  checks.push(pgCheck);
  
  // OpenAI health check with API validation
  const openAICheck = await runHealthCheck('OpenAI', async () => {
    try {
      const { getOpenAIClient } = await import('./models');
      const client = getOpenAIClient();
      
      // Use a lightweight endpoint to check API access
      const response = await client.models.list();
      if (!response.data || response.data.length === 0) {
        throw new Error('No models available');
      }
    } catch (importError) {
      // If models module doesn't exist, try RAG module
      const { getOpenAIClient } = await import('./rag');
      const client = getOpenAIClient();
      await client.models.list();
    }
  });
  checks.push(openAICheck);
  
  // Notion health check with user verification
  const notionCheck = await runHealthCheck('Notion', async () => {
    const { getNotionClient } = await import('./etl');
    const client = getNotionClient();
    
    // Check user access and permissions
    const user = await client.users.me({});
    if (!user.id) {
      throw new Error('Invalid Notion user response');
    }
  });
  checks.push(notionCheck);
  
  // Vector Database health check
  const vectorCheck = await runHealthCheck('Vector Database', async () => {
    try {
      const { getVectorIndex } = await import('./rag');
      const index = getVectorIndex();
      
      // Try to get index info/stats as a lightweight check
      await index.info();
    } catch (error) {
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('Vector database API key not configured');
      }
      throw error;
    }
  });
  checks.push(vectorCheck);
  
  // S3/Storage health check
  const storageCheck = await runHealthCheck('S3 Storage', async () => {
    const { testStorageConnection } = await import('./storage');
    await testStorageConnection();
  });
  checks.push(storageCheck);
  
  healthChecks = checks;
  return checks;
}

export function generateSystemReport(): {
  summary: string;
  metrics: SystemMetrics;
  health: HealthCheck[];
  recommendations: string[];
} {
  const currentMetrics = getSystemMetrics();
  const currentHealth = getHealthChecks();
  
  const unhealthyServices = currentHealth.filter(check => check.status === 'unhealthy');
  const degradedServices = currentHealth.filter(check => check.status === 'degraded');
  
  const recommendations: string[] = [];
  
  if (unhealthyServices.length > 0) {
    recommendations.push(`Critical: ${unhealthyServices.length} services are unhealthy: ${unhealthyServices.map(s => s.service).join(', ')}`);
  }
  
  if (degradedServices.length > 0) {
    recommendations.push(`Warning: ${degradedServices.length} services are degraded: ${degradedServices.map(s => s.service).join(', ')}`);
  }
  
  if (currentMetrics.memoryUsage > 500) {
    recommendations.push('High memory usage detected. Consider optimizing queries or restarting services.');
  }
  
  const avgResponseTime = Object.values(currentMetrics.apiResponseTimes).reduce((a, b) => a + b, 0) / Object.values(currentMetrics.apiResponseTimes).length;
  if (avgResponseTime > 2000) {
    recommendations.push('High API response times detected. Check database and external service performance.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All systems operating normally.');
  }
  
  const summary = `System Status: ${unhealthyServices.length === 0 ? (degradedServices.length === 0 ? 'Healthy' : 'Degraded') : 'Critical'} | Uptime: ${Math.floor(currentMetrics.uptime / 3600)}h ${Math.floor((currentMetrics.uptime % 3600) / 60)}m | Memory: ${currentMetrics.memoryUsage.toFixed(1)}MB`;
  
  return {
    summary,
    metrics: currentMetrics,
    health: currentHealth,
    recommendations,
  };
}
