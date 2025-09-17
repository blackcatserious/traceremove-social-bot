import { NextResponse } from 'next/server';
import { fullSync } from '@/lib/etl';
import { initializeDatabase } from '@/lib/database';
import { withRetry } from '@/lib/error-handling';
import { performHealthChecks } from '@/lib/monitoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`🚀 [${requestId}] Starting full ETL sync (nightly cron)...`);
  
  try {
    // Pre-flight health checks
    console.log(`🔍 [${requestId}] Running pre-flight health checks...`);
    const healthChecks = await performHealthChecks();
    const unhealthyServices = healthChecks.filter(check => check.status === 'unhealthy');
    
    if (unhealthyServices.length > 0) {
      console.error(`❌ [${requestId}] Pre-flight health check failed:`, {
        unhealthyServices: unhealthyServices.map(s => ({ service: s.service, error: s.error })),
        allChecks: healthChecks
      });
      
      return NextResponse.json({
        success: false,
        error: 'Pre-flight health check failed',
        details: `Unhealthy services: ${unhealthyServices.map(s => s.service).join(', ')}`,
        healthChecks,
        requestId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      }, { status: 503 });
    }
    
    console.log(`✅ [${requestId}] Health checks passed, initializing database...`);
    
    // Initialize database with retry logic
    await withRetry(async () => {
      console.log(`💾 [${requestId}] Initializing database schema...`);
      await initializeDatabase();
    }, 3, 2000, 1.5);
    
    console.log(`📊 [${requestId}] Database initialized, starting full sync...`);
    
    // Run full sync with timeout monitoring
    const syncStartTime = Date.now();
    const results = await fullSync();
    const syncDuration = Date.now() - syncStartTime;
    const totalDuration = Date.now() - startTime;
    
    // Analyze results
    const summary = results._summary || {};
    const isSuccess = summary.status === 'success';
    const isPartialSuccess = summary.status === 'partial';
    
    console.log(`${isSuccess ? '✅' : isPartialSuccess ? '⚠️' : '❌'} [${requestId}] Full ETL sync completed:`, {
      status: summary.status,
      totalDatabases: summary.totalDatabases,
      successful: summary.successfulDatabases,
      failed: summary.failedDatabases,
      totalRecords: `${summary.totalLoaded}/${summary.totalExtracted}`,
      errors: summary.totalErrors,
      syncDuration,
      totalDuration,
      performance: summary.performance
    });

    return NextResponse.json({
      success: isSuccess || isPartialSuccess,
      type: 'full',
      results,
      requestId,
      timestamp: new Date().toISOString(),
      duration: {
        total: totalDuration,
        sync: syncDuration,
        preCheck: syncStartTime - startTime
      },
      performance: {
        recordsPerSecond: summary.performance?.recordsPerSecond || 0,
        averageDbTime: summary.performance?.averageDbTime || 0
      }
    }, { status: isSuccess ? 200 : (isPartialSuccess ? 206 : 500) });
    
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`💥 [${requestId}] Full ETL sync failed:`, {
      error: errorMessage,
      stack: errorStack,
      duration: totalDuration,
      requestId
    });
    
    // Determine error type for better debugging
    let errorType = 'unknown';
    let statusCode = 500;
    
    if (errorMessage.includes('Environment validation failed')) {
      errorType = 'configuration';
      statusCode = 503;
    } else if (errorMessage.includes('Database') || errorMessage.includes('PostgreSQL')) {
      errorType = 'database';
      statusCode = 503;
    } else if (errorMessage.includes('Notion')) {
      errorType = 'external_api';
      statusCode = 502;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      errorType = 'timeout';
      statusCode = 504;
    } else if (errorMessage.includes('rate limit')) {
      errorType = 'rate_limit';
      statusCode = 429;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorType,
      requestId,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      debug: {
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        uptime: process.uptime()
      }
    }, { status: statusCode });
  }
}
