import { NextResponse } from 'next/server';
import { incrementalSync } from '@/lib/etl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    console.log('Starting incremental ETL sync (15-min cron)...');
    
    const results = await incrementalSync();
    
    console.log('Incremental ETL sync completed:', results);
    
    return NextResponse.json({
      success: true,
      type: 'incremental',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Incremental ETL sync failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
