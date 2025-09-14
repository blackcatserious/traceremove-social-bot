import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle URL verification challenge
    if (body?.type === 'url_verification') {
      return new Response(body.challenge, { status: 200 });
    }
    
    // Handle app_mention/message.im → proxy to /api/search
    // Add your Slack event handling logic here
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack events API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Slack event' },
      { status: 500 }
    );
  }
}
