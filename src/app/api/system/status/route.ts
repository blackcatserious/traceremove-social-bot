import { NextRequest, NextResponse } from 'next/server';
import { validateEnvironment } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const validation = validateEnvironment();
    
    const systemStatus = {
      status: validation.valid ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: {
        valid: validation.valid,
        missing: validation.missing,
        warnings: validation.warnings,
      },
      services: {
        api: 'operational',
        database: validation.missing.includes('PG_DSN') ? 'unavailable' : 'operational',
        vector: validation.missing.includes('UPSTASH_VECTOR_REST_URL') ? 'unavailable' : 'operational',
        ai: validation.missing.includes('OPENAI_API_KEY') ? 'unavailable' : 'operational',
        notion: validation.missing.includes('NOTION_TOKEN') ? 'unavailable' : 'operational',
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
