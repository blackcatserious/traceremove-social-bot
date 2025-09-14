import { NextRequest, NextResponse } from 'next/server';
import { xai } from '@ai-sdk/xai';
import { streamText } from 'ai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = streamText({
      model: xai('grok-2-1212'),
      prompt,
    });

    let responseText = '';
    for await (const textPart of result.textStream) {
      responseText += textPart;
    }

    return NextResponse.json({ result: responseText });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'XAI Chat API endpoint is active',
    timestamp: new Date().toISOString(),
    note: 'Use POST with prompt to chat with xai model.'
  });
}
