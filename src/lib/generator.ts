import type { Platform } from './limits';
import { normalizeTags } from './hashtags';
import { composeForPlatform } from './formatters';
import { generateWithLLM, LLMMode } from './llm';

export interface GenerateInput {
  platform: Platform;
  title: string;
  summary?: string;
  url?: string;
  tags?: string[];
}

/**
 * Generate the final post text.  If `OPENAI_API_KEY` is provided and
 * `LLM_MODE` is not `off`, this calls the LLM helper.  Otherwise the
 * simple formatter is used.
 */
export async function generatePost(input: GenerateInput): Promise<string> {
  const { platform, title, summary, url, tags } = input;
  const llmMode = (process.env.LLM_MODE as LLMMode) || 'off';
  const hasLLM = !!process.env.OPENAI_API_KEY && llmMode !== 'off';
  if (hasLLM) {
    const { text } = await generateWithLLM({ platform, title, summary, url, tags });
    return text.trim();
  }
  const tagsList = tags || [];
  const text = composeForPlatform({ platform, title, summary, canonicalUrl: url, tags: tagsList });
  return text.trim();
}