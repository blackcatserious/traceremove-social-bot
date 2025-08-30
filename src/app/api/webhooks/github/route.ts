import { NextRequest, NextResponse } from 'next/server';
import { handleGitHubWebhook } from '@/lib/publishers/github';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GitHub webhook endpoint for handling repository events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');
    
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (secret && signature) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const bodyData = encoder.encode(body);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, bodyData);
      const expectedSignature = `sha256=${Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    if (!event) {
      return NextResponse.json({ error: 'Missing event header' }, { status: 400 });
    }
    
    const payload = JSON.parse(body);
    await handleGitHubWebhook(payload, event);
    
    return NextResponse.json({ success: true, event });
    
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'GitHub webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
