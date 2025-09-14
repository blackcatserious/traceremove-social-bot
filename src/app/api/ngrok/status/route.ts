import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const urlFile = join(process.cwd(), '.ngrok-url');
    
    if (existsSync(urlFile)) {
      const ngrokUrl = readFileSync(urlFile, 'utf-8').trim();
      return NextResponse.json({
        active: true,
        url: ngrokUrl,
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({
      active: false,
      message: 'ngrok tunnel not active',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ngrok status error:', error);
    return NextResponse.json({
      active: false,
      error: 'Failed to check ngrok status',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
