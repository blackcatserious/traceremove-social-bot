import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    return NextResponse.json({ 
      conversationId,
      messages: [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, messages } = body;
    
    if (!conversationId || !messages) {
      return NextResponse.json({ error: 'Conversation ID and messages required' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      conversationId,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Save chat history error:', error);
    return NextResponse.json({ error: 'Failed to save chat history' }, { status: 500 });
  }
}
