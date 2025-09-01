import { NextResponse } from 'next/server';
import { fullSync } from '@/lib/etl';
import { initializeDatabase } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    console.log('Starting full ETL sync (nightly cron)...');
    
    await initializeDatabase();
    
    const results = await fullSync();
    
    console.log('Full ETL sync completed:', results);
    
    return NextResponse.json({
      success: true,
      type: 'full',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Full ETL sync failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
