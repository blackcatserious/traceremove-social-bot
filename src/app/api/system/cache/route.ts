import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { getCacheStats } = await import('@/lib/cache-advanced');
    const stats = getCacheStats();
    
    return NextResponse.json({
      cache: stats,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Cache stats API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch cache statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { clearAdvancedCache } = await import('@/lib/cache-advanced');
    clearAdvancedCache();
    
    return NextResponse.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Cache clear API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
