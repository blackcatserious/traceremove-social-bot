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
  
  if (personaId === 'philosopher') {
    if (lowerQuery.includes('technology') || lowerQuery.includes('tech')) {
      return `Source: Philosophy of Technology Research\nTechnology fundamentally alters human experience and social structures. Digital systems create new forms of mediation between humans and their environment, requiring careful philosophical analysis of their implications for consciousness, agency, and social organization.

---

Source: Ethics in Digital Systems\nEvery technological artifact embeds values and assumptions about how humans should interact with the world. The design of digital interfaces, algorithms, and data structures reflects particular worldviews and power relationships that deserve critical examination.`;
    }
    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence')) {
      return `Source: AI and Human Cognition\nArtificial intelligence challenges traditional boundaries between natural and artificial cognition. The development of AI systems raises fundamental questions about the nature of intelligence, consciousness, and what it means to think.

---

Source: Machine Learning Ethics\nAs AI systems become more autonomous, we must grapple with questions of responsibility, bias, and the delegation of decision-making to algorithmic processes. The philosophical implications extend beyond technical considerations to fundamental questions about human agency.`;
    }
    return `Source: Technology and Society\nThe relationship between technology and human society is dialectical - technology shapes social structures while being shaped by social forces. Understanding this dynamic is crucial for navigating our increasingly digital world.`;
  }
  
  if (personaId === 'orm_multilang') {
    if (lowerQuery.includes('reputation') || lowerQuery.includes('brand')) {
      return `Source: Online Reputation Management Best Practices\nEffective ORM requires proactive monitoring, strategic content creation, and rapid response protocols. Key metrics include sentiment analysis, mention volume, and engagement rates across platforms.

---

Source: Crisis Communication Strategies\nDuring reputation crises, transparency and authenticity are crucial. Develop pre-approved response templates, establish clear escalation procedures, and maintain consistent messaging across all channels.`;
    }
    if (lowerQuery.includes('social media') || lowerQuery.includes('content')) {
      return `Source: Social Media Strategy Framework\nSuccessful social media presence requires consistent brand voice, regular engagement, and platform-specific content optimization. Focus on value-driven content that resonates with target audiences.

---

Source: Content Calendar Planning\nStrategic content planning involves audience analysis, competitive research, and performance tracking. Maintain 70% educational content, 20% promotional, and 10% entertainment for optimal engagement.`;
    }
    return `Source: Digital Marketing Fundamentals\nModern digital marketing integrates SEO, social media, content marketing, and reputation management. Success requires data-driven decision making and continuous optimization based on performance metrics.`;
  }
  
  if (personaId === 'orm_russian') {
    if (lowerQuery.includes('репутация') || lowerQuery.includes('reputation')) {
      return `Source: Управление репутацией в интернете\nЭффективное управление репутацией требует постоянного мониторинга упоминаний бренда, создания позитивного контента и быстрого реагирования на негативные отзывы. Ключевые показатели включают тональность упоминаний и уровень вовлеченности аудитории.

---

Source: Антикризисные коммуникации\nВ кризисных ситуациях важны прозрачность и оперативность реагирования. Необходимо иметь готовые шаблоны ответов и четкие процедуры эскалации для минимизации репутационных рисков.`;
    }
    if (lowerQuery.includes('соцсети') || lowerQuery.includes('социальные сети')) {
      return `Source: Стратегия социальных сетей\nУспешное присутствие в социальных сетях требует последовательного тона бренда, регулярного взаимодействия с аудиторией и оптимизации контента под специфику каждой платформы.

---

Source: Планирование контента\nСтратегическое планирование контента включает анализ аудитории, исследование конкурентов и отслеживание эффективности. Рекомендуемое соотношение: 70% образовательного контента, 20% рекламного, 10% развлекательного.`;
    }
    return `Source: Основы цифрового маркетинга\nСовременный цифровой маркетинг объединяет SEO, социальные сети, контент-маркетинг и управление репутацией. Успех требует принятия решений на основе данных и постоянной оптимизации.`;
  }
  
  return '';
}

export async function getContext(query: string, personaId: string, limit: number = 5, persona: 'public' | 'internal' = 'public'): Promise<string> {
  try {
    const queryEmbedding = await embedText(query);
    const vectorIndex = getVectorIndex();
    
    const collection = persona === 'public' ? 'traceremove_public' : 'traceremove_internal';
    
    const results = await vectorIndex.query({
      vector: queryEmbedding,
      topK: limit,
      filter: `personaId = "${personaId}" AND collection = "${collection}"`,
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
    console.log('Using mock context due to API configuration:', error instanceof Error ? error.message : 'Unknown error');
    return generateMockContext(query, personaId);
  }
}
