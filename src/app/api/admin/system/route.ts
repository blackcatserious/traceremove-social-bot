import { NextRequest, NextResponse } from 'next/server';
import { handleAPIError, AuthenticationError } from '../../../../lib/error-handling';
import { getEnvironmentConfig } from '../../../../lib/env-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const config = getEnvironmentConfig();
    if (!config) {
      throw new Error('System configuration not available');
    }

    const { performHealthChecks, generateSystemReport } = await import('../../../../lib/monitoring');
    const { getPerformanceStats } = await import('../../../../lib/performance');
    const { getCacheStats } = await import('../../../../lib/cache-advanced');

    const [healthChecks, systemReport, performanceStats, cacheStats] = await Promise.all([
      performHealthChecks(),
      generateSystemReport(),
      getPerformanceStats(),
      getCacheStats(),
    ]);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      configuration: {
        multiModelProviders: {
          openai: !!config.openai.apiKey,
          anthropic: !!config.multiModel.anthropic,
          google: !!config.multiModel.google,
          mistral: !!config.multiModel.mistral,
          groq: !!config.multiModel.groq,
        },
        databases: {
          postgresql: !!config.database.pgDsn,
          vector: !!config.vector.qdrantUrl,
          cache: !!config.cache.redisUrl,
        },
        etl: {
          batchSize: config.etl.batchSize,
          maxRetries: config.etl.maxRetries,
          fullSyncInterval: config.etl.fullSyncInterval,
          incrementalSyncInterval: config.etl.incrementalSyncInterval,
        },
        monitoring: {
          enablePerformanceTracking: config.monitoring.enablePerformanceTracking,
          enableHealthChecks: config.monitoring.enableHealthChecks,
          logLevel: config.monitoring.logLevel,
        },
      },
      health: {
        checks: healthChecks,
        summary: systemReport.summary,
        recommendations: systemReport.recommendations,
      },
      performance: performanceStats,
      cache: cacheStats,
    });

  } catch (error) {
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    switch (action) {
      case 'clear_cache':
        const { clearAdvancedCache } = await import('../../../../lib/cache-advanced');
        clearAdvancedCache();
        return NextResponse.json({ success: true, message: 'Cache cleared successfully' });

      case 'trigger_etl':
        const { fullSync } = await import('../../../../lib/etl');
        const results = await fullSync();
        return NextResponse.json({ success: true, results });

      case 'health_check':
        const { performHealthChecks } = await import('../../../../lib/monitoring');
        const checks = await performHealthChecks();
        return NextResponse.json({ success: true, checks });

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}
