import { NextRequest, NextResponse } from 'next/server';
import { performHealthChecks, generateSystemReport } from '@/lib/monitoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const detailed = request.nextUrl.searchParams.get('detailed') === 'true';
    
    if (detailed) {
      const report = generateSystemReport();
      const healthChecks = await performHealthChecks();
      
      return NextResponse.json({
        ...report,
        health: healthChecks,
        timestamp: new Date().toISOString(),
      });
    } else {
      const healthChecks = await performHealthChecks();
      const overallStatus = healthChecks.every(check => check.status === 'healthy') 
        ? 'healthy' 
        : healthChecks.some(check => check.status === 'unhealthy') 
          ? 'unhealthy' 
          : 'degraded';
      
      return NextResponse.json({
        status: overallStatus,
        services: healthChecks.length,
        healthy: healthChecks.filter(check => check.status === 'healthy').length,
        degraded: healthChecks.filter(check => check.status === 'degraded').length,
        unhealthy: healthChecks.filter(check => check.status === 'unhealthy').length,
        timestamp: new Date().toISOString(),
      });
    }
    
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
