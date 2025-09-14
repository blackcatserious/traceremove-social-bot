import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { performanceMonitor } = await import('@/lib/performance');
    
    const summary = performanceMonitor.getMetricsSummary();
    const slowQueries = performanceMonitor.getSlowestQueries(5);
    
    return NextResponse.json({
      summary,
      slowQueries,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
