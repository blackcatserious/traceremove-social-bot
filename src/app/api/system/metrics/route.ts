import { NextRequest, NextResponse } from 'next/server';
import { getSystemMetrics, recordApiResponse } from '@/lib/monitoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const metrics = getSystemMetrics();
    const responseTime = Date.now() - startTime;
    
    recordApiResponse('/api/system/metrics', responseTime);
    
    return NextResponse.json({
      ...metrics,
      requestResponseTime: responseTime,
    });
    
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
