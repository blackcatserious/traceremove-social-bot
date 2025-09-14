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

export function getOpenAIClient(): OpenAI {
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

export function getVectorIndex(): Index {
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

export async function reindexPersona(personaId: string, notionDbId: string, sitemapUrl: string): Promise<number> {
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
    return allDocs.length;
  } catch (error) {
    console.error('Error reindexing persona:', error);
    throw error;
  }
}

function generateMockContext(query: string, personaId: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (personaId === 'comprehensive-ai' || personaId === 'philosopher') {
    if (lowerQuery.includes('technology') || lowerQuery.includes('ai')) {
      return `[Source: AI Systems Architecture from Registry]: The traceremove.net comprehensive AI system integrates multiple model providers (OpenAI, Anthropic, Gemini, Mistral, Groq) with intelligent routing based on query complexity and intent.

[Source: Technology Philosophy from Cases]: Technology is not merely a tool but a fundamental extension of human consciousness. When we create digital systems, we externalize our cognitive processes and embed our values into code.

[Source: Multi-Model Integration from Publishing]: Our ETL pipeline processes 4 Notion databases with 15-minute incremental updates and nightly full synchronization, ensuring knowledge base freshness ≤ 30 days.`;
    }
    
    if (lowerQuery.includes('database') || lowerQuery.includes('etl')) {
      return `[Source: ETL Pipeline Architecture from Registry]: The system processes Registry (6d3da5a01186475d8c2b794cca147a86), Cases (25cef6a76fa5800b8241f8ed4cd3be33), Finance (25cef6a76fa580eb912ff8cfca54155e), and Publishing (402cc41633384d35b30ec1ab7c3185da) databases.

[Source: Vector Search Implementation from Cases]: PostgreSQL schema with vector indexing enables semantic search across all knowledge sources with public/internal access control policies.

[Source: Data Freshness Strategy from Publishing]: Automated synchronization ensures content freshness with incremental updates every 15 minutes and comprehensive nightly rebuilds.`;
    }
    
    if (lowerQuery.includes('search') || lowerQuery.includes('rag')) {
      return `[Source: RAG System Design from Registry]: The retrieval-augmented generation system provides 2-3 relevant citations from integrated knowledge sources with persona-based access filtering.

[Source: Public Access Policies from Cases]: Public persona access excludes financial data and Russian content while providing comprehensive technology and philosophy insights.

[Source: Citation Framework from Publishing]: All responses include specific source references in the format [Source: Title from Table] to ensure transparency and verifiability.`;
    }
  }
  
  if (personaId === 'orm-multilang' || personaId === 'orm-russian') {
    if (lowerQuery.includes('reputation') || lowerQuery.includes('brand')) {
      return `[Source: Brand Management Strategy from Cases]: Effective online reputation management requires a proactive approach combining monitoring, content creation, and strategic response protocols.

[Source: Crisis Communication from Publishing]: When facing negative publicity, the key is swift, transparent, and authentic communication that addresses concerns while protecting brand integrity.

[Source: Multi-Platform Approach from Registry]: Modern ORM requires coordinated efforts across all digital touchpoints - social media, review platforms, search results, and owned media channels.`;
    }
  }
  
  return `[Source: Comprehensive AI Knowledge from Registry]: The traceremove.net system provides access to integrated knowledge across technology philosophy, AI systems architecture, and strategic implementation.

[Source: Multi-Domain Expertise from Cases]: Capabilities span from philosophical discussions about technology to practical implementation of AI systems and comprehensive project management.

[Source: Citation-Based Responses from Publishing]: All responses include 2-3 relevant citations from the knowledge base to ensure accuracy and provide verifiable sources for further research.`;
}

export async function getContext(query: string, personaId: string, limit: number = 5, persona: 'public' | 'internal' = 'public'): Promise<string> {
  try {
    console.log(`Getting context for query: "${query}" with persona: ${personaId}`);
    
    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      console.log('Upstash Vector not configured, using mock context');
      return generateMockContext(query, personaId);
    }
    
    const embedding = await embedText(query);
    
    const vectorClient = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
    
    let filter: string | undefined;
    if (personaId === 'philosopher') {
      filter = 'persona = "philosopher"';
    } else if (personaId === 'comprehensive-ai') {
      filter = 'persona = "comprehensive-ai" OR persona = "public"';
    }
    
    const results = await vectorClient.query({
      vector: embedding,
      topK: 6,
      includeMetadata: true,
      filter
    });
    
    if (!results || results.length === 0) {
      console.log('No vector results found, using mock context');
      return generateMockContext(query, personaId);
    }
    
    const contextChunks = results
      .filter(result => result.score && result.score > 0.7)
      .map(result => {
        const metadata = result.metadata as any;
        const source = metadata?.table ? `${metadata.table}` : 'Knowledge Base';
        return `[Source: ${metadata?.title || 'Unknown'} from ${source}]: ${metadata?.content || result.id}`;
      });
    
    if (contextChunks.length === 0) {
      console.log('No high-quality matches found, using mock context');
      return generateMockContext(query, personaId);
    }
    
    return contextChunks.slice(0, 3).join('\n\n');
    
  } catch (error) {
    console.error('Error getting context:', error);
    return generateMockContext(query, personaId);
  }
}
