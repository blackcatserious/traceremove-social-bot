import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.REINDEX_TOKEN}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  // trigger your ETL webhook/queue here
  // e.g., await fetch(process.env.ETL_WEBHOOK!, { method: 'POST' })
  return NextResponse.json({ ok: true }, { status: 202 });
}
