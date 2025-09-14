import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'edge';

function verifySlackSignature(req: NextRequest) {
  const ts = req.headers.get('x-slack-request-timestamp') || '';
  const sig = req.headers.get('x-slack-signature') || '';
  const body = (req as any).body || '';
  const base = `v0:${ts}:${body}`;
  const mySig = 'v0=' + crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET!).update(base).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(mySig), Buffer.from(sig))) throw new Error('bad sig');
}

async function postToSlack(channel: string, text: string, thread_ts?: string) {
  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify({ channel, text, thread_ts }),
  });
}

export async function POST(req: NextRequest) {
  try {
    verifySlackSignature(req);
    const form = await req.formData();
    const text = String(form.get('text') || '');
    const channel = String(form.get('channel_id') || '');
    const thread_ts = String(form.get('thread_ts') || '');
    const persona = /--internal/.test(text) ? 'internal' : 'public';
    const url = new URL(`${req.nextUrl.origin}/api/search`);
    url.searchParams.set('q', text.replace('--internal','').trim());
    url.searchParams.set('persona', persona);
    const r = await fetch(url, { cache: 'no-store' });
    const { answer, sources } = await r.json();
    const sourcesText = sources.map((s:any)=>`• ${s.title}: ${s.url}`).join('\n');
    await postToSlack(channel, `${answer}\n\nSources:\n${sourcesText}`, thread_ts);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 401 });
  }
}
