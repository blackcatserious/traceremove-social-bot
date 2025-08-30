import OpenAI from 'openai';
import { Client as NotionClient } from '@notionhq/client';
import { Index } from '@upstash/vector';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    title?: string;
    url?: string;
    type: 'notion' | 'sitemap';
  };
}

let openaiClient: OpenAI | null = null;
let notionClient: NotionClient | null = null;
let vectorIndex: Index | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === '') {
      throw new Error('OpenAI API key not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function getNotionClient(): NotionClient {
  if (!notionClient) {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
      throw new Error('Notion token not configured');
    }
    notionClient = new NotionClient({ auth: token });
  }
  return notionClient;
}

function getVectorIndex(): Index {
  if (!vectorIndex) {
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!url || !token) {
      throw new Error('Upstash Vector credentials not configured');
    }
    vectorIndex = new Index({ url, token });
  }
  return vectorIndex;
}

export async function embedText(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

export async function fetchNotionDocs(databaseId: string): Promise<DocumentChunk[]> {
  if (!databaseId) return [];
  
  try {
    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    
    const chunks: DocumentChunk[] = [];
    
    for (const page of response.results) {
      if ('properties' in page) {
        let title = 'Untitled';
        for (const [key, property] of Object.entries(page.properties)) {
          if (property.type === 'title' && property.title.length > 0) {
            title = property.title[0].plain_text;
            break;
          }
        }
        
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
        });
        
        let content = '';
        for (const block of blocks.results) {
          if ('type' in block) {
            content += extractTextFromBlock(block) + '\n';
          }
        }
        
        if (content.trim()) {
          chunks.push({
            id: `notion-${page.id}`,
            content: content.trim(),
            metadata: {
              source: 'notion',
              title,
              url: `https://notion.so/${page.id}`,
              type: 'notion',
            },
          });
        }
      }
    }
    
    return chunks;
  } catch (error) {
    console.error('Error fetching Notion docs:', error);
    return [];
  }
}

function extractTextFromBlock(block: { type: string; [key: string]: any }): string {
  switch (block.type) {
    case 'paragraph':
      return block.paragraph?.rich_text?.map((text: any) => text.plain_text).join('') || '';
    case 'heading_1':
      return block.heading_1?.rich_text?.map((text: any) => text.plain_text).join('') || '';
    case 'heading_2':
      return block.heading_2?.rich_text?.map((text: any) => text.plain_text).join('') || '';
    case 'heading_3':
      return block.heading_3?.rich_text?.map((text: any) => text.plain_text).join('') || '';
    case 'bulleted_list_item':
      return '• ' + (block.bulleted_list_item?.rich_text?.map((text: any) => text.plain_text).join('') || '');
    case 'numbered_list_item':
      return '1. ' + (block.numbered_list_item?.rich_text?.map((text: any) => text.plain_text).join('') || '');
    case 'quote':
      return '> ' + (block.quote?.rich_text?.map((text: any) => text.plain_text).join('') || '');
    case 'code':
      return '```\n' + (block.code?.rich_text?.map((text: any) => text.plain_text).join('') || '') + '\n```';
    default:
      return '';
  }
}

export async function fetchSiteDocs(sitemapUrl: string): Promise<DocumentChunk[]> {
  try {
    const sitemapResponse = await fetch(sitemapUrl);
    const sitemapXml = await sitemapResponse.text();
    
    const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g);
    if (!urlMatches) return [];
    
    const urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
    const chunks: DocumentChunk[] = [];
    
    const limitedUrls = urls.slice(0, 10);
    
    for (const url of limitedUrls) {
      try {
        const pageResponse = await fetch(url);
        const html = await pageResponse.text();
        
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (textContent.length > 100) {
          const chunkSize = 1000;
          for (let i = 0; i < textContent.length; i += chunkSize) {
            const chunk = textContent.slice(i, i + chunkSize);
            chunks.push({
              id: `sitemap-${url}-${i}`,
              content: chunk,
              metadata: {
                source: 'sitemap',
                title: extractTitleFromHtml(html),
                url,
                type: 'sitemap',
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
    }
    
    return chunks;
  } catch (error) {
    console.error('Error fetching site docs:', error);
    return [];
  }
}

function extractTitleFromHtml(html: string): string {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

export async function reindexPersona(personaId: string, notionDbId: string, sitemapUrl: string): Promise<void> {
  try {
    console.log(`Reindexing persona: ${personaId}`);
    
    const [notionDocs, siteDocs] = await Promise.all([
      fetchNotionDocs(notionDbId),
      fetchSiteDocs(sitemapUrl),
    ]);
    
    const allDocs = [...notionDocs, ...siteDocs];
    console.log(`Found ${allDocs.length} documents to index`);
    
    const vectorIndex = getVectorIndex();
    
    for (const doc of allDocs) {
      try {
        const embedding = await embedText(doc.content);
        
        await vectorIndex.upsert({
          id: `${personaId}-${doc.id}`,
          vector: embedding,
          metadata: {
            ...doc.metadata,
            personaId,
            content: doc.content,
          },
        });
      } catch (error) {
        console.error(`Error indexing document ${doc.id}:`, error);
      }
    }
    
    console.log(`Reindexing complete for persona: ${personaId}`);
  } catch (error) {
    console.error('Error reindexing persona:', error);
    throw error;
  }
}

export async function getContext(query: string, personaId: string, limit: number = 5): Promise<string> {
  try {
    const queryEmbedding = await embedText(query);
    const vectorIndex = getVectorIndex();
    
    const results = await vectorIndex.query({
      vector: queryEmbedding,
      topK: limit,
      filter: `personaId = "${personaId}"`,
      includeMetadata: true,
    });
    
    if (!results || results.length === 0) {
      return '';
    }
    
    const contextChunks = results
      .filter(match => match.metadata && match.metadata.content)
      .map(match => {
        const metadata = match.metadata!;
        return `Source: ${metadata.title || metadata.source}\n${metadata.content}`;
      });
    
    return contextChunks.join('\n\n---\n\n');
  } catch (error) {
    console.error('Error getting context:', error);
    return '';
  }
}
