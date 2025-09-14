import { NextRequest, NextResponse } from 'next/server';
import { handleAPIError, ValidationError } from '../../../../lib/error-handling';
import { logger, LogLevel } from '../../../../lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as LogLevel | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const stats = searchParams.get('stats') === 'true';

    if (limit && (limit < 1 || limit > 1000)) {
      throw new ValidationError('Limit must be between 1 and 1000');
    }

    if (level && !['debug', 'info', 'warn', 'error'].includes(level)) {
      throw new ValidationError('Invalid log level. Must be one of: debug, info, warn, error');
    }

    if (stats) {
      const logStats = logger.getLogStats();
      return NextResponse.json({
        stats: logStats,
        timestamp: new Date().toISOString(),
      });
    }

    const logs = logger.getLogs(level || undefined, limit);
    
    return NextResponse.json({
      logs,
      total: logs.length,
      level: level || 'all',
      limit: limit || 'none',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    logger.clearLogs();
    
    return NextResponse.json({
      success: true,
      message: 'Logs cleared successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}
