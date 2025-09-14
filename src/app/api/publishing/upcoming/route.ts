import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    // Placeholder response for smoke test
    const deadlines = [
      { 
        id: 'ai-ethics-conf',
        title: 'AI Ethics Conference', 
        due_date: '2025-09-21', 
        url: 'https://example.com/ai-ethics',
        priority: 'urgent',
        daysUntilDue: 7
      },
      { 
        id: 'ml-journal-sub',
        title: 'ML Journal Submission', 
        due_date: '2025-09-25', 
        url: 'https://example.com/ml-journal',
        priority: 'soon',
        daysUntilDue: 11
      }
    ];
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      upcoming: deadlines.slice(0, limit),
      total: deadlines.length,
      summary: {
        urgent: deadlines.filter(d => d.priority === 'urgent').length,
        soon: deadlines.filter(d => d.priority === 'soon').length,
        total: deadlines.length,
      },
      responseTime,
      generatedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Publishing upcoming API error:', error);
    
    const responseTime = Date.now() - startTime;
    const { recordApiResponse } = await import('@/lib/monitoring');
    recordApiResponse('/api/publishing/upcoming', responseTime);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch upcoming publications', 
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      },
      { status: 500 }
    );
  }
}

async function getPublishingStats(persona: string): Promise<any> {
  try {
    const visibilityCondition = persona === 'public' 
      ? "visibility = 'public'" 
      : "visibility IN ('public', 'internal')";
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN due_date IS NOT NULL AND due_date >= CURRENT_DATE THEN 1 END) as upcoming,
        COUNT(CASE WHEN submission_status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN submission_status = 'submitted' THEN 1 END) as submitted,
        COUNT(CASE WHEN submission_status = 'draft' THEN 1 END) as drafts,
        COUNT(CASE WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE AND submission_status NOT IN ('published', 'rejected', 'withdrawn') THEN 1 END) as overdue
      FROM publishing 
      WHERE ${visibilityCondition}
    `;
    
    const result = await query(statsQuery);
    const stats = result.rows[0];
    
    return {
      total: parseInt(stats.total),
      upcoming: parseInt(stats.upcoming),
      published: parseInt(stats.published),
      submitted: parseInt(stats.submitted),
      drafts: parseInt(stats.drafts),
      overdue: parseInt(stats.overdue),
    };
    
  } catch (error) {
    console.error('Error getting publishing stats:', error);
    return {
      total: 0,
      upcoming: 0,
      published: 0,
      submitted: 0,
      drafts: 0,
      overdue: 0,
    };
  }
}
