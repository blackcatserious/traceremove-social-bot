import { NextRequest, NextResponse } from 'next/server';
import { optimizeCache, recordCacheMetrics } from '@/lib/cache-optimization';
import { handleAPIError } from '@/lib/error-handling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        const optimization = await optimizeCache();
        return NextResponse.json({
          status: 'active',
          optimization,
          timestamp: new Date().toISOString()
        });

      case 'optimize':
        const result = await optimizeCache();
        return NextResponse.json({
          message: 'Cache optimization completed',
          result,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: status, optimize' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Cache management API error:', error);
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, keys, metrics } = await request.json();

    switch (action) {
      case 'record_metrics':
        if (metrics && Array.isArray(metrics)) {
          for (const metric of metrics) {
            recordCacheMetrics(metric.key, metric.hit, metric.responseTime);
          }
          return NextResponse.json({ message: 'Metrics recorded successfully' });
        }
        return NextResponse.json({ error: 'Invalid metrics data' }, { status: 400 });

      case 'warm_cache':
        if (keys && Array.isArray(keys)) {
          const { cacheOptimizer } = await import('@/lib/cache-optimization');
          const result = await cacheOptimizer.warmCache(keys);
          return NextResponse.json({
            message: 'Cache warming completed',
            result
          });
        }
        return NextResponse.json({ error: 'Invalid keys data' }, { status: 400 });

      case 'maintenance':
        const { cacheOptimizer: optimizer } = await import('@/lib/cache-optimization');
        const maintenanceResult = await optimizer.performMaintenance();
        return NextResponse.json({
          message: 'Cache maintenance completed',
          result: maintenanceResult
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: record_metrics, warm_cache, maintenance' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Cache management POST error:', error);
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}
