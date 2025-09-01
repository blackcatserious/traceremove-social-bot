import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const persona = request.nextUrl.searchParams.get('persona') || 'public';
    
    const visibilityCondition = persona === 'public' 
      ? "visibility = 'public'" 
      : "visibility IN ('public', 'internal')";
    
    const upcomingQuery = `
      SELECT 
        notion_id,
        title,
        ownership,
        type,
        channel,
        pub_date,
        venue,
        citation_style,
        submission_status,
        due_date,
        doi,
        lang,
        tags,
        notes,
        url,
        updated_at
      FROM publishing 
      WHERE ${visibilityCondition}
        AND due_date IS NOT NULL 
        AND due_date >= CURRENT_DATE
        AND submission_status NOT IN ('published', 'rejected', 'withdrawn')
      ORDER BY due_date ASC, updated_at DESC
      LIMIT $1
    `;
    
    const result = await query(upcomingQuery, [limit]);
    
    const deadlines = result.rows.map((row: any) => ({
      id: row.notion_id,
      title: row.title,
      ownership: row.ownership,
      type: row.type,
      channel: row.channel,
      pubDate: row.pub_date,
      venue: row.venue,
      citationStyle: row.citation_style,
      submissionStatus: row.submission_status,
      dueDate: row.due_date,
      doi: row.doi,
      lang: row.lang,
      tags: row.tags || [],
      notes: row.notes,
      url: row.url,
      updatedAt: row.updated_at,
      daysUntilDue: Math.ceil((new Date(row.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    }));
    
    const stats = await getPublishingStats(persona);
    
    return NextResponse.json({
      upcoming: deadlines,
      total: deadlines.length,
      stats,
      persona,
      generatedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Publishing upcoming API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming publications', details: error instanceof Error ? error.message : 'Unknown error' },
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
