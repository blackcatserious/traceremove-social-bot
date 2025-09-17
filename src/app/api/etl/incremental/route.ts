import { NextResponse } from 'next/server';
import { incrementalSync } from '@/lib/etl';
import { withRetry } from '@/lib/error-handling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`🔄 [${requestId}] Starting incremental ETL sync (15-min cron)...`);
  
  try {
    // Run incremental sync with retry logic
    const results = await withRetry(async () => {
      return await incrementalSync();
    }, 2, 5000, 1.5); // 2 retries, 5s initial delay, 1.5x backoff
    
    const duration = Date.now() - startTime;
    const summary = results._summary || {};
    
    console.log(`✅ [${requestId}] Incremental ETL sync completed:`, {
      totalUpdated: summary.totalUpdated,
      totalProcessed: summary.totalProcessed,
      totalErrors: summary.totalErrors,
      duration,
      requestId
    });
    
    return NextResponse.json({
      success: true,
      type: 'incremental',
      results,
      requestId,
      timestamp: new Date().toISOString(),
      duration,
      performance: {
        recordsPerSecond: duration > 0 ? Math.round((summary.totalProcessed || 0) / duration * 1000) : 0,
        updatesPerSecond: duration > 0 ? Math.round((summary.totalUpdated || 0) / duration * 1000) : 0
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`💥 [${requestId}] Incremental ETL sync failed:`, {
      error: errorMessage,
      stack: errorStack,
      duration,
      requestId
    });
    
    // Determine error type for better debugging
    let errorType = 'unknown';
    let statusCode = 500;
    
    if (errorMessage.includes('Database') || errorMessage.includes('PostgreSQL')) {
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
      duration,
      debug: {
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        uptime: process.uptime()
      }
    }, { status: statusCode });
  }
}
