import { NextRequest, NextResponse } from 'next/server';
import { contentGenerator } from '../../../lib/generator';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { type, topic, requirements, deliverables, timeline, audience, platform, language } = await request.json();

    if (!type || !topic) {
      return NextResponse.json(
        { error: 'Type and topic are required' },
        { status: 400 }
      );
    }

    const result = await contentGenerator.generateComprehensiveContent({
      type,
      topic,
      requirements: requirements || [],
      deliverables,
      timeline,
      audience,
      platform,
      language
    });

    return NextResponse.json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('Comprehensive API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'capabilities':
        return NextResponse.json({
          capabilities: [
            'content_creation',
            'project_management', 
            'development',
            'analysis',
            'strategy',
            'automation',
            'integration_management'
          ],
          integrations: [
            'notion',
            'github',
            'social_media',
            'analytics',
            'development_tools',
            'project_management_tools'
          ]
        });

      case 'templates':
        return NextResponse.json({
          templates: [
            { id: 'article', name: 'Technical Article', type: 'content' },
            { id: 'strategy', name: 'Strategic Plan', type: 'strategy' },
            { id: 'project', name: 'Project Plan', type: 'project' },
            { id: 'analysis', name: 'Analysis Report', type: 'analysis' },
            { id: 'development', name: 'Development Project', type: 'development' }
          ]
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Comprehensive API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
