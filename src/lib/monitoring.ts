export interface SystemMetrics {
  timestamp: string;
  apiResponseTimes: Record<string, number>;
  databaseConnections: number;
  vectorIndexSize: number;
  notionSyncStatus: Record<string, { lastSync: string; recordCount: number; errors: number }>;
  modelUsage: Record<string, { requests: number; tokens: number; errors: number }>;
  memoryUsage: number;
  uptime: number;
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
  return { ...metrics };
}

export function getHealthChecks(): HealthCheck[] {
  return [...healthChecks];
}

export async function performHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];
  
  try {
    const startTime = Date.now();
    const { getPool } = await import('./database');
    const pool = getPool();
    await pool.query('SELECT 1');
    const responseTime = Date.now() - startTime;
    
    checks.push({
      service: 'PostgreSQL',
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    checks.push({
      service: 'PostgreSQL',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastCheck: new Date().toISOString(),
    });
  }
  
  try {
    const startTime = Date.now();
    const { getOpenAIClient } = await import('./models');
    const client = getOpenAIClient();
    await client.models.list();
    const responseTime = Date.now() - startTime;
    
    checks.push({
      service: 'OpenAI',
      status: responseTime < 2000 ? 'healthy' : 'degraded',
      responseTime,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    checks.push({
      service: 'OpenAI',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastCheck: new Date().toISOString(),
    });
  }
  
  try {
    const startTime = Date.now();
    const { getNotionClient } = await import('./etl');
    const client = getNotionClient();
    await client.users.me({});
    const responseTime = Date.now() - startTime;
    
    checks.push({
      service: 'Notion',
      status: responseTime < 2000 ? 'healthy' : 'degraded',
      responseTime,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    checks.push({
      service: 'Notion',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastCheck: new Date().toISOString(),
    });
  }
  
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
