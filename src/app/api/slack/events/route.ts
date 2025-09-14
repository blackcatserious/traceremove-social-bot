import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (body?.type === 'url_verification') {
      return new NextResponse(body.challenge, { status: 200 });
    }
    
    // handle app_mention/message.im → proxy to /api/search
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Slack events error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
