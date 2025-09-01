import OpenAI from 'openai';
import type { Platform } from './limits';
import { normalizeTags } from './hashtags';
import { TAG_LIMIT } from './limits';
import { BODY_MAX } from './limits';

/**
 * Supported LLM modes.  When `off` the generator will not call OpenAI.
 */
export type LLMMode = 'off' | 'simple' | 'json';

const SYSTEM_SIMPLE_PROMPT = `
Ты — редактор бренда traceremove.dev, персона «философ технологий». Пиши по-русски.
Требуется вернуть ГОТОВЫЙ пост для указанной платформы из входных данных (platform, title, summary, url, tags).

Тон: спокойный, лаконичный, без хайпа и эмодзи, без клише. Короткие фразы, допустим 1 мягкий риторический вопрос.
Ценность: не пересказ, а сжатое философское осмысление (человек↔технологии, этика, архитектура).

Хэштеги: только из заданных tags, строчные, очищенные, ≤20 символов, #traceremove — в конце.
Не выдумывай новые. Хэштеги отдельной строкой.

Ссылка: если url есть — отдельной строкой «Читать: {url}», без изменений.

Правила:
- X: основной текст ≤270 символов (без ссылки и хэштегов). Структура:
  1) текст; 2) «Читать: {url}» (если есть); 3) 1–3 хэштега (через пробел).
- Facebook: один короткий абзац; затем (если есть) «Читать: {url}»; затем 3–5 хэштегов.
- Instagram: 1–2 коротких абзаца; затем (если есть) «Читать: {url}»; затем 5–10 хэштегов.

Запреты: реклама, псевдонаука, агрессия, политагитация, спам.
Вывод: только чистый текст поста, без Markdown и служебных строк.
`.trim();

const SYSTEM_JSON_PROMPT = `
Ты — редактор traceremove.dev («философ технологий»). Верни строгий JSON с полями:
{text: string, hashtags: string[], meta: { platform: "X"|"Facebook"|"Instagram", length: number }}

Тон: спокойный, ясный, без эмодзи/клише, допускается 1 риторический вопрос.
Смысл: этика/архитектура/последствия технологий для человека.

Нормализация тегов: только из входных, строчные, чистые, ≤20; добавь "#traceremove" последним, если нет.
Лимиты: X=1–3; Facebook=3–5; Instagram=5–10.

Структура сборки (которую ты выполнишь сам):
- X: body ≤270 символов; затем (если есть) строка «Читать: {url}»; затем строка хэштегов (через пробел).
- Facebook: короткий абзац → (url) → хэштеги.
- Instagram: 1–2 коротких абзаца → (url) → хэштеги.

Если url нет — не вставляй строку «Читать: ...».
meta.length — длина body (без ссылки и хэштегов).
Ответ: только валидный JSON без пояснений.
`.trim();

/**
 * Generate a post using OpenAI.  Depending on the value of the `LLM_MODE`
 * environment variable either `simple` or `json` mode will be used.
 */
export async function generateWithLLM(input: {
  platform: Platform;
  title: string;
  summary?: string;
  url?: string;
  tags?: string[];
}): Promise<{ text: string; hashtags: string[] }> {
  const mode: LLMMode = (process.env.LLM_MODE as LLMMode) || 'off';
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || mode === 'off') {
    throw new Error('LLM is disabled or OPENAI_API_KEY missing');
  }
  const client = new OpenAI({ apiKey });
  if (mode === 'simple') {
    const tags = normalizeTags(input.tags || [], input.platform);
    const user = [
      `platform: ${input.platform}`,
      `title: ${input.title}`,
      input.summary ? `summary: ${input.summary}` : '',
      input.url ? `url: ${input.url}` : '',
      tags.length ? `tags: ${tags.map(h => h.replace('#','')).join(',')}` : ''
    ].filter(Boolean).join('\n');
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_SIMPLE_PROMPT },
        { role: 'user', content: user }
      ],
      temperature: 0.5
    });
    const text = (res.choices[0]?.message?.content || '').trim();
    return { text, hashtags: extractHashtags(text) };
  }
  if (mode === 'json') {
    const tags = normalizeTags(input.tags || [], input.platform);
    const payload = {
      platform: input.platform,
      title: input.title,
      summary: input.summary,
      url: input.url,
      tags: tags.map(h => h.replace('#',''))
    };
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_JSON_PROMPT },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });
    const raw = res.choices[0]?.message?.content || '{}';
    let obj: any;
    try {
      obj = JSON.parse(raw);
    } catch {
      obj = {};
    }
    const hashtags: string[] = Array.isArray(obj.hashtags)
      ? obj.hashtags
      : tags;
    const body = stripLinkAndTags(obj.text || '');
    const urlLine = input.url ? `Читать: ${input.url}` : '';
    const tagsLine = hashtags.length ? hashtags.join(' ') : '';
    const assembled = [body.trim(), urlLine, tagsLine].filter(Boolean).join('\n');
    return { text: assembled, hashtags };
  }
  throw new Error(`Unknown LLM mode: ${mode}`);
}

function extractHashtags(s: string): string[] {
  const lines = s.trim().split(/\n+/);
  const last = lines[lines.length - 1];
  return last?.trim().startsWith('#') ? last.trim().split(/\s+/) : [];
}

function stripLinkAndTags(s: string): string {
  return s
    .split(/\n+/)
    .filter(line => !line.trim().startsWith('Читать: ') && !line.trim().startsWith('#'))
    .join('\n');
}
