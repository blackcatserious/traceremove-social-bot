import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, format = 'json' } = body;
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const exportData = {
      conversationId,
      exportedAt: new Date().toISOString(),
      format,
      downloadUrl: `/api/chat/export/${conversationId}?format=${format}`
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export conversation error:', error);
    return NextResponse.json({ error: 'Failed to export conversation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const format = searchParams.get('format') || 'json';
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const conversationData = {
      id: conversationId,
      messages: [],
      exportedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      return NextResponse.json(conversationData);
    } else if (format === 'txt') {
      const textContent = `Conversation Export\nID: ${conversationId}\nExported: ${conversationData.exportedAt}\n\n`;
      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="conversation_${conversationId}.txt"`
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Export download error:', error);
    return NextResponse.json({ error: 'Failed to download export' }, { status: 500 });
  }
}
