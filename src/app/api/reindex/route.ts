import { NextRequest, NextResponse } from 'next/server';

import { getEnvironmentConfig } from '@/lib/env-validation';
import {
  AuthenticationError,
  ExternalServiceError,
  ValidationError,
  handleAPIError,
} from '@/lib/error-handling';

export const runtime = 'nodejs';

type ReindexMode = 'full' | 'incremental';

interface ReindexRequestBody {
  mode?: ReindexMode;
  since?: string;
  payload?: unknown;
}

function extractBearerToken(header: string | null): string {
  if (!header) {
    throw new AuthenticationError('Missing Authorization header');
  }

  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    throw new AuthenticationError('Invalid Authorization header');
  }

  return token.trim();
}

export async function POST(req: NextRequest) {
  try {
    const config = getEnvironmentConfig();
    const expectedToken = config.security.reindexToken;

    if (!expectedToken) {
      throw new AuthenticationError('Reindex token not configured');
    }

    const providedToken = extractBearerToken(req.headers.get('authorization'));
    if (providedToken !== expectedToken) {
      throw new AuthenticationError('Invalid reindex token');
    }

    let body: ReindexRequestBody = {};
    const contentType = req.headers.get('content-type') || '';
    if (contentType === '' || contentType.includes('application/json')) {
      if (req.body !== null) {
        try {
          body = (await req.json()) as ReindexRequestBody;
        } catch (error) {
          throw new ValidationError('Invalid JSON payload');
        }
      }
    } else {
      throw new ValidationError('Unsupported content type. Use application/json');
    }

    const mode: ReindexMode = body.mode === 'incremental' ? 'incremental' : 'full';
    const since = body.since ? new Date(body.since) : undefined;

    if (mode === 'incremental' && body.since && Number.isNaN(since?.getTime())) {
      throw new ValidationError('Invalid "since" timestamp');
    }

    const webhookUrl = config.etl.webhook;

    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'traceremove-admin-reindex/1.0',
          'x-reindex-trigger': 'admin-endpoint',
        },
        body: JSON.stringify({
          mode,
          since: since?.toISOString(),
          payload: body.payload ?? null,
          triggeredAt: new Date().toISOString(),
        }),
      });

      const text = await response.text();
      let parsed: unknown = null;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }

      if (!response.ok) {
        throw new ExternalServiceError(
          'ETL webhook',
          `Request failed with status ${response.status}`,
          parsed
        );
      }

      return NextResponse.json(
        {
          ok: true,
          mode,
          since: since?.toISOString() ?? null,
          forwarded: true,
          response: parsed,
        },
        { status: 202 }
      );
    }

    const { fullSync, incrementalSync } = await import('@/lib/etl');
    const results =
      mode === 'incremental'
        ? await incrementalSync(since)
        : await fullSync();

    return NextResponse.json(
      {
        ok: true,
        mode,
        since: since?.toISOString() ?? null,
        forwarded: false,
        results,
      },
      { status: 202 }
    );
  } catch (error) {
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}
