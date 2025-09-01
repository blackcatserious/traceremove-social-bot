import type { Platform } from './limits';
import { BODY_MAX } from './limits';
import { normalizeTags } from './hashtags';

interface FormatInput {
  platform: Platform;
  title: string;
  summary?: string;
  canonicalUrl?: string;
  tags?: string[];
}

/**
 * Fallback text formatter used when LLM is disabled.  It builds a short
 * “philosophical” message by taking the summary (or title) and trimming it
 * to the maximum body length.  It then appends the link and hashtags on
 * separate lines according to platform rules.
 */
export function composeForPlatform(input: FormatInput): string {
  const { platform, title, summary, canonicalUrl, tags } = input;
  const bodyMax = BODY_MAX[platform];
  const text = (summary || title || '').trim();
  let body = text;
  if (body.length > bodyMax) {
    body = body.slice(0, bodyMax - 1).trimEnd() + '…';
  }
  const urlLine = canonicalUrl ? `Читать: ${canonicalUrl}` : '';
  const tagsLine = normalizeTags(tags || [], platform).join(' ');
  // Compose lines according to platform guidelines
  const lines: string[] = [];
  lines.push(body);
  if (urlLine) lines.push(urlLine);
  if (tagsLine) lines.push(tagsLine);
  return lines.filter(Boolean).join('\n');
}