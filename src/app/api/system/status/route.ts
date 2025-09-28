import { NextRequest, NextResponse } from 'next/server';
import { getEnvironmentValidationSummary } from '@/lib/env-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const validation = getEnvironmentValidationSummary();

    const integrationStatus = new Map(validation.integrations.map((entry) => [entry.key, entry]));
    const requiredIntegrationStatus = (key: string): 'operational' | 'unavailable' => {
      const integration = integrationStatus.get(key);
      if (!integration) {
        return 'operational';
      }
      return integration.status === 'ready' ? 'operational' : 'unavailable';
    };

    const systemStatus = {
      status: validation.valid ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: {
        valid: validation.valid,
        missing: validation.missing,
        warnings: validation.warnings,
        mode: validation.mode.type,
        reason: validation.mode.type === 'relaxed' ? validation.mode.reason : undefined,
        integrations: validation.integrations,
        integrationStats: validation.integrationStats,
      },
      services: {
        api: 'operational',
        database: requiredIntegrationStatus('database'),
        vector: requiredIntegrationStatus('vector'),
        ai: requiredIntegrationStatus('openai'),
        notion: requiredIntegrationStatus('notion'),
      },
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
    
    return NextResponse.json(systemStatus);
    
  } catch (error) {
    console.error('System status error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to retrieve system status',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
