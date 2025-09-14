import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.REINDEX_TOKEN}`;
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Trigger your ETL webhook/queue here
    // e.g., await fetch(process.env.ETL_WEBHOOK!, { method: 'POST' })
    
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    console.error('Slack reindex API error:', error);
    return NextResponse.json(
      { error: 'Failed to process reindex request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
