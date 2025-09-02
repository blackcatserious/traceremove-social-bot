import { Client as NotionClient } from '@notionhq/client';
import { query, CatalogRecord, CaseRecord, PublishingRecord, FinanceRecord } from '../database';
import { uploadFile, generateContentKey } from '../storage';
import { embedText, getVectorIndex } from '../rag';

export interface NotionDatabaseConfig {
  id: string;
  name: string;
  table: 'catalog' | 'cases' | 'publishing' | 'finance';
  mapping: Record<string, string>;
  visibility: 'public' | 'internal';
}

export const NOTION_DATABASES: NotionDatabaseConfig[] = [
  {
    id: process.env.NOTION_DB_REGISTRY || '6d3da5a01186475d8c2b794cca147a86',
    name: 'Registry',
    table: 'catalog',
    mapping: {
      title: 'Name',
      summary: 'Краткое содержание',
      content: 'Content',
      topic: 'Тематика',
      tags: 'Теги',
      status: 'Статус',
      lang: 'Язык',
      url: 'URL',
      author: 'Автор',
      last_editor: 'Последний редактор',
      created_at: 'Дата создания',
      updated_at: 'Последнее изменение'
    },
    visibility: 'public'
  },
  {
    id: process.env.NOTION_DB_CASES || '25cef6a76fa5800b8241f8ed4cd3be33',
    name: 'Cases',
    table: 'cases',
    mapping: {
      name: 'Name',
      date_start: 'Дата запуска',
      client_url: 'Клиенты:',
      keys: 'Ключи',
      terms: 'Сроки',
      status: 'Статус',
      price: 'Стоимость',
      url: 'url'
    },
    visibility: 'public'
  },
  {
    id: process.env.NOTION_DB_PUBLISHING || '402cc41633384d35b30ec1ab7c3185da',
    name: 'Publishing',
    table: 'publishing',
    mapping: {
      title: 'Название',
      ownership: 'Принадлежность',
      type: 'Тип',
      channel: 'Канал',
      pub_date: 'Дата публикации',
      venue: 'Журнал',
      citation_style: 'Формат цитирования',
      submission_status: 'Статус подачи',
      due_date: 'Срок подачи',
      doi: 'DOI/Link',
      lang: 'Язык',
      tags: 'Теги',
      notes: 'Краткое ТЗ',
      url: 'Ссылка'
    },
    visibility: 'public'
  },
  {
    id: process.env.NOTION_DB_FINANCE || '25cef6a76fa580eb912ff8cfca54155e',
    name: 'Finance',
    table: 'finance',
    mapping: {
      name: 'Name',
      amount: 'Сумма',
      notes: 'Расход',
      date_start: 'Дата запуска'
    },
    visibility: 'internal'
  }
];

let notionClient: NotionClient | null = null;

export function getNotionClient(): NotionClient {
  if (!notionClient) {
    const token = process.env.NOTION_TOKEN;
    if (!token || token.includes('your_') || token === '' || token.includes('place')) {
      throw new Error('Notion token not configured properly. Please set NOTION_TOKEN environment variable with a valid integration token.');
    }
    notionClient = new NotionClient({ 
      auth: token,
      timeoutMs: 30000,
    });
  }
  return notionClient;
}

export async function extractFromNotion(databaseConfig: NotionDatabaseConfig): Promise<any[]> {
  const notion = getNotionClient();
  const allPages: any[] = [];
  let cursor: string | undefined;
  let pageCount = 0;
  
  console.log(`Extracting from ${databaseConfig.name} database (${databaseConfig.id})...`);
  
  do {
    try {
      const response = await notion.databases.query({
        database_id: databaseConfig.id,
        start_cursor: cursor,
        page_size: 100,
      });
      
      allPages.push(...response.results);
      cursor = response.next_cursor || undefined;
      pageCount += response.results.length;
      
      if (pageCount % 100 === 0) {
        console.log(`Extracted ${pageCount} pages from ${databaseConfig.name}...`);
      }
      
    } catch (error) {
      console.error(`Failed to extract from ${databaseConfig.name}:`, error);
      throw new Error(`Notion extraction failed for ${databaseConfig.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } while (cursor);
  
  console.log(`Completed extraction: ${allPages.length} pages from ${databaseConfig.name}`);
  return allPages;
}

export function transformNotionPage(page: any, mapping: Record<string, string>): Record<string, any> {
  const transformed: Record<string, any> = {
    notion_id: page.id,
    created_at: new Date(page.created_time),
    updated_at: new Date(page.last_edited_time),
  };
  
  for (const [dbField, notionField] of Object.entries(mapping)) {
    const property = page.properties[notionField];
    if (!property) continue;
    
    switch (property.type) {
      case 'title':
        transformed[dbField] = property.title?.[0]?.plain_text || '';
        break;
      case 'rich_text':
        transformed[dbField] = property.rich_text?.map((t: any) => t.plain_text).join('') || '';
        break;
      case 'select':
        transformed[dbField] = property.select?.name || '';
        break;
      case 'multi_select':
        transformed[dbField] = property.multi_select?.map((s: any) => s.name) || [];
        break;
      case 'date':
        if (property.date?.start) {
          transformed[dbField] = new Date(property.date.start);
        }
        break;
      case 'number':
        transformed[dbField] = property.number;
        break;
      case 'url':
        transformed[dbField] = property.url;
        break;
      case 'people':
        transformed[dbField] = property.people?.[0]?.name || '';
        break;
      default:
        transformed[dbField] = property.plain_text || '';
    }
  }
  
  return transformed;
}

export async function loadToPostgreSQL(
  records: Record<string, any>[],
  table: string,
  visibility: 'public' | 'internal'
): Promise<void> {
  if (records.length === 0) return;
  
  for (const record of records) {
    record.visibility = visibility;
    
    const fields = Object.keys(record);
    const values = Object.values(record);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const upsertQuery = `
      INSERT INTO ${table} (${fields.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (notion_id) DO UPDATE SET
      ${fields.filter(f => f !== 'notion_id').map(f => `${f} = EXCLUDED.${f}`).join(', ')}
    `;
    
    await query(upsertQuery, values);
  }
}

export async function loadToS3(record: Record<string, any>, table: string): Promise<string | null> {
  const content = record.content || record.summary || record.notes;
  if (!content) return null;
  
  const key = generateContentKey(record.notion_id, 'markdown');
  const markdown = `# ${record.title || record.name}\n\n${content}`;
  
  await uploadFile(key, markdown, 'text/markdown');
  return key;
}

export async function loadToVectorDB(
  record: Record<string, any>,
  table: string,
  visibility: 'public' | 'internal'
): Promise<void> {
  const content = record.content || record.summary || record.notes || record.title || record.name;
  if (!content || content.length < 10) return;
  
  try {
    const embedding = await embedText(content);
    const vectorIndex = getVectorIndex();
    
    const namespace = visibility === 'public' ? 'traceremove_public' : 'traceremove_internal';
    
    const vectorData = {
      id: `${table}_${record.notion_id}`,
      vector: embedding,
      metadata: {
        table,
        notion_id: record.notion_id,
        title: record.title || record.name,
        content: content.substring(0, 1000),
        visibility,
        lang: record.lang || 'en',
        status: record.status || 'active',
        updated_at: record.updated_at?.toISOString() || new Date().toISOString(),
        tags: Array.isArray(record.tags) ? record.tags.join(', ') : '',
        topic: record.topic || '',
      }
    };
    
    await vectorIndex.upsert([vectorData], { namespace });
    
  } catch (error) {
    console.error(`Failed to index ${table} record ${record.notion_id}:`, error);
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('Vector database API key not configured properly. Please check UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.');
    }
  }
}

export async function syncDatabase(databaseConfig: NotionDatabaseConfig): Promise<{
  extracted: number;
  loaded: number;
  errors: number;
  progress: Array<{ step: string; status: 'completed' | 'failed'; timestamp: string; details?: string }>;
}> {
  const progress: Array<{ step: string; status: 'completed' | 'failed'; timestamp: string; details?: string }> = [];
  const startTime = Date.now();
  
  console.log(`🚀 Starting sync for ${databaseConfig.name} database...`);
  progress.push({
    step: `Starting ${databaseConfig.name} sync`,
    status: 'completed',
    timestamp: new Date().toISOString(),
  });
  
  try {
    const pages = await extractFromNotion(databaseConfig);
    console.log(`📥 Extracted ${pages.length} pages from ${databaseConfig.name}`);
    progress.push({
      step: `Extracted ${pages.length} pages from Notion`,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: `${pages.length} pages retrieved in ${Date.now() - startTime}ms`,
    });
    
    const transformedRecords = pages.map(page => 
      transformNotionPage(page, databaseConfig.mapping)
    );
    
    console.log(`🔄 Transforming ${transformedRecords.length} records for ${databaseConfig.name}...`);
    progress.push({
      step: `Transformed ${transformedRecords.length} records`,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
    
    await loadToPostgreSQL(transformedRecords, databaseConfig.table, databaseConfig.visibility);
    console.log(`💾 Loaded ${transformedRecords.length} records to PostgreSQL`);
    progress.push({
      step: `Loaded to PostgreSQL`,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: `${transformedRecords.length} records upserted`,
    });
    
    let loadedCount = 0;
    let s3Errors = 0;
    let vectorErrors = 0;
    
    for (const [index, record] of transformedRecords.entries()) {
      try {
        await loadToS3(record, databaseConfig.table);
        await loadToVectorDB(record, databaseConfig.table, databaseConfig.visibility);
        loadedCount++;
        
        if ((index + 1) % 50 === 0) {
          console.log(`📊 Progress: ${index + 1}/${transformedRecords.length} records processed`);
        }
      } catch (error) {
        console.error(`❌ Failed to process record ${record.notion_id}:`, error);
        if (error instanceof Error && error.message.includes('S3')) {
          s3Errors++;
        } else if (error instanceof Error && error.message.includes('Vector')) {
          vectorErrors++;
        }
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Completed sync for ${databaseConfig.name}: ${loadedCount}/${pages.length} records processed in ${duration}ms`);
    
    progress.push({
      step: `Completed vector indexing`,
      status: loadedCount === pages.length ? 'completed' : 'failed',
      timestamp: new Date().toISOString(),
      details: `${loadedCount}/${pages.length} records indexed successfully. S3 errors: ${s3Errors}, Vector errors: ${vectorErrors}`,
    });
    
    try {
      const { updateMetric } = await import('../monitoring');
      updateMetric('notionSyncStatus', {
        ...((await import('../monitoring')).getSystemMetrics().notionSyncStatus || {}),
        [databaseConfig.name]: {
          lastSync: new Date().toISOString(),
          recordCount: loadedCount,
          errors: pages.length - loadedCount,
        }
      });
    } catch (monitoringError) {
      console.debug('Monitoring update failed:', monitoringError);
    }
    
    return {
      extracted: pages.length,
      loaded: loadedCount,
      errors: pages.length - loadedCount,
      progress,
    };
    
  } catch (error) {
    console.error(`💥 Failed to sync ${databaseConfig.name}:`, error);
    progress.push({
      step: `Sync failed`,
      status: 'failed',
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function incrementalSync(since?: Date): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const sinceDate = since || new Date(Date.now() - 15 * 60 * 1000);
  const startTime = Date.now();
  
  console.log(`🔄 Starting incremental sync since ${sinceDate.toISOString()}...`);
  
  for (const dbConfig of NOTION_DATABASES) {
    const dbStartTime = Date.now();
    try {
      console.log(`📊 Checking ${dbConfig.name} for updates...`);
      const notion = getNotionClient();
      const response = await notion.databases.query({
        database_id: dbConfig.id,
        filter: {
          property: 'Last edited time',
          last_edited_time: {
            after: sinceDate.toISOString(),
          },
        },
        page_size: 100,
      });
      
      if (response.results.length > 0) {
        console.log(`📥 Found ${response.results.length} updated records in ${dbConfig.name}`);
        
        const transformedRecords = response.results.map(page => 
          transformNotionPage(page, dbConfig.mapping)
        );
        
        await loadToPostgreSQL(transformedRecords, dbConfig.table, dbConfig.visibility);
        
        let processedCount = 0;
        let errorCount = 0;
        
        for (const record of transformedRecords) {
          try {
            await loadToS3(record, dbConfig.table);
            await loadToVectorDB(record, dbConfig.table, dbConfig.visibility);
            processedCount++;
          } catch (error) {
            console.error(`❌ Failed to process record ${record.notion_id}:`, error);
            errorCount++;
          }
        }
        
        const dbDuration = Date.now() - dbStartTime;
        console.log(`✅ ${dbConfig.name}: ${processedCount}/${response.results.length} records processed in ${dbDuration}ms`);
        
        results[dbConfig.name] = {
          updated: response.results.length,
          processed: processedCount,
          errors: errorCount,
          since: sinceDate.toISOString(),
          duration: dbDuration,
        };
      } else {
        console.log(`📭 No updates found in ${dbConfig.name}`);
        results[dbConfig.name] = { 
          updated: 0, 
          processed: 0,
          errors: 0,
          since: sinceDate.toISOString(),
          duration: Date.now() - dbStartTime,
        };
      }
      
    } catch (error) {
      const dbDuration = Date.now() - dbStartTime;
      console.error(`💥 Incremental sync failed for ${dbConfig.name}:`, error);
      results[dbConfig.name] = { 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: dbDuration,
      };
    }
  }
  
  const totalDuration = Date.now() - startTime;
  const totalUpdated = Object.values(results).reduce((sum, result: any) => sum + (result.updated || 0), 0);
  const totalProcessed = Object.values(results).reduce((sum, result: any) => sum + (result.processed || 0), 0);
  const totalErrors = Object.values(results).reduce((sum, result: any) => sum + (result.errors || 0), 0);
  
  console.log(`🎯 Incremental sync completed: ${totalProcessed}/${totalUpdated} records processed with ${totalErrors} errors in ${totalDuration}ms`);
  
  results._summary = {
    totalUpdated,
    totalProcessed,
    totalErrors,
    duration: totalDuration,
    timestamp: new Date().toISOString(),
  };
  
  return results;
}

export async function fullSync(): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  
  for (const dbConfig of NOTION_DATABASES) {
    try {
      const result = await syncDatabase(dbConfig);
      results[dbConfig.name] = result;
    } catch (error) {
      console.error(`Full sync failed for ${dbConfig.name}:`, error);
      results[dbConfig.name] = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  return results;
}
