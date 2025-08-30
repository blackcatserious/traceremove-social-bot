import type { Platform } from './limits';
import { TAG_LIMIT } from './limits';

const CLEAN_RE = /[^a-z0-9_а-яё-]/gi;

/**
 * Normalise a single tag: lower case, remove non‑alphanumeric characters and
 * truncate to 20 characters.  Returns an empty string if no characters remain.
 */
function normaliseTag(raw: string): string {
  const s = (raw || '').toLowerCase().replace(CLEAN_RE, '').slice(0, 20).trim();
  return s;
}

/**
 * Normalise an array of tags and apply per‑platform limits.  The tag
 * `traceremove` is always appended (if not present) and counted towards the
 * maximum.  The returned values include the leading `#`.
 */
export function normalizeTags(raw: string[] | undefined, platform: Platform): string[] {
  const out: string[] = [];
  for (const t of raw || []) {
    const n = normaliseTag(t);
    if (n && !out.includes(n)) out.push(n);
  }
  // ensure traceremove is last
  if (!out.includes('traceremove')) out.push('traceremove');
  const max = TAG_LIMIT[platform].max;
  if (out.length > max) {
    // keep traceremove last, take the first (max - 1) tags
    const filtered = out.filter(t => t !== 'traceremove').slice(0, max - 1);
    out.splice(0, out.length, ...filtered, 'traceremove');
  }
  return out.map(t => `#${t}`);
}