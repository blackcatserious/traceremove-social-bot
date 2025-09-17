import { Client as NotionClient } from '@notionhq/client';
import { query, CatalogRecord, CaseRecord, PublishingRecord, FinanceRecord } from '../database';
import { uploadFile, generateContentKey } from '../storage';
import { embedText, getVectorIndex } from '../rag';
import { getEnvironmentConfig, shouldMockExternalApis } from '../env-validation';
import { withRetry, ExternalServiceError, DatabaseError, CircuitBreaker } from '../error-handling';

// ETL environment validation function
async function validateETLEnvironment(): Promise<void> {
  const errors: string[] = [];
  
  try {
    // Validate configuration
    const config = getEnvironmentConfig();
    if (!config) {
      errors.push('Environment configuration not available');
    }
    
    // Validate database connection
    try {
      const { getPool } = await import('../database');
      const pool = getPool();
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
    } catch (dbError) {
      errors.push(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
    
    // Validate Notion access
    if (!shouldMockExternalApis()) {
      try {
        const notion = getNotionClient();
        await notion.users.me({});
      } catch (notionError) {
        errors.push(`Notion API access failed: ${notionError instanceof Error ? notionError.message : 'Unknown error'}`);
      }
    }
    
    // Validate required environment variables for ETL
    const requiredEnvVars = ['NOTION_TOKEN', 'PG_DSN'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar] || process.env[envVar]?.includes('placeholder')) {
        errors.push(`Required environment variable ${envVar} is not properly configured`);
      }
    }
    
  } catch (error) {
    errors.push(`Environment validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  if (errors.length > 0) {
    throw new Error(`ETL environment validation failed: ${errors.join('; ')}`);
  }
}

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
    if (shouldMockExternalApis()) {
      console.log('Using mock Notion client for development');
      notionClient = {} as NotionClient;
      return notionClient;
    }

    const config = getEnvironmentConfig();
    if (!config?.notion.token) {
      throw new ExternalServiceError('Notion', 'Token not configured properly. Please set NOTION_TOKEN environment variable with a valid integration token.');
    }
    notionClient = new NotionClient({ 
      auth: config.notion.token,
      timeoutMs: 60000, // Increased timeout for large database queries
      fetch: async (url, options) => {
        // Add retry logic at the fetch level
        const maxRetries = 3;
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url, options);
            
            // Handle rate limiting gracefully
            if (response.status === 429) {
              const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
              console.log(`🚦 Notion rate limited, waiting ${retryAfter}s before retry ${i + 1}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
              continue;
            }
            
            return response;
          } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
              const delay = Math.pow(2, i) * 1000; // Exponential backoff
              console.log(`🔄 Notion request failed, retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        throw lastError;
      }
    });
  }
  return notionClient;
}

export async function extractFromNotion(databaseConfig: NotionDatabaseConfig): Promise<any[]> {
  const notion = getNotionClient();
  const allPages: any[] = [];
  let cursor: string | undefined;
  let pageCount = 0;
  let requestCount = 0;
  const startTime = Date.now();
  
  console.log(`📥 Extracting from ${databaseConfig.name} database (${databaseConfig.id})...`);
  
  // Circuit breaker for Notion API calls
  const circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s timeout
  
  do {
    try {
      requestCount++;
      const requestStart = Date.now();
      
      const response = await circuitBreaker.execute(() => 
        withRetry(async () => {
          if (shouldMockExternalApis()) {
            return {
              results: [],
              next_cursor: null,
              has_more: false,
            };
          }

          try {
            return await notion.databases.query({
              database_id: databaseConfig.id,
              start_cursor: cursor,
              page_size: 100,
            });
          } catch (apiError: any) {
            if (apiError?.code === 'rate_limited') {
              console.log(`⏳ Rate limited on ${databaseConfig.name}, waiting before retry...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
              throw new ExternalServiceError('Notion', 'Rate limited - will retry');
            }
            throw apiError;
          }
        }, 5, 2000, 1.5) // 5 retries, starting at 2s delay, 1.5x backoff
      );
      
      const requestTime = Date.now() - requestStart;
      
      allPages.push(...response.results);
      cursor = response.next_cursor || undefined;
      pageCount += response.results.length;
      
      if (pageCount % 100 === 0 || requestTime > 5000) {
        console.log(`📊 ${databaseConfig.name}: ${pageCount} pages extracted (${requestCount} requests, last request: ${requestTime}ms)`);
      }
      
      // Rate limiting: wait between requests to avoid hitting limits
      if (!shouldMockExternalApis() && requestTime < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      const extractionTime = Date.now() - startTime;
      console.error(`💥 Failed to extract from ${databaseConfig.name}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        pageCount,
        requestCount,
        extractionTime,
        database: databaseConfig.name,
        circuitBreakerState: circuitBreaker.getState()
      });
      
      throw new ExternalServiceError('Notion', `Extraction failed for ${databaseConfig.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } while (cursor);
  
  const totalTime = Date.now() - startTime;
  console.log(`✅ Extraction complete: ${allPages.length} pages from ${databaseConfig.name} in ${totalTime}ms (${Math.round(allPages.length / totalTime * 1000)} pages/sec)`);
  
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
  
  const config = getEnvironmentConfig();
  const batchSize = config?.etl.batchSize || 50;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    await withRetry(async () => {
      for (const record of batch) {
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
    }, config?.etl.maxRetries || 3);
    
    if (i + batchSize < records.length) {
      console.log(`Loaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} to ${table}`);
    }
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
  
  // Light environment validation (less strict than full sync)
  try {
    if (!shouldMockExternalApis()) {
      const config = getEnvironmentConfig();
      if (!config?.notion.token) {
        throw new Error('Notion API token not configured');
      }
    }
  } catch (validationError) {
    console.warn('⚠️ Environment validation warning:', validationError);
    // Continue with incremental sync even if some validations fail
  }
  
  for (const dbConfig of NOTION_DATABASES) {
    const dbStartTime = Date.now();
    try {
      console.log(`📊 Checking ${dbConfig.name} for updates...`);
      
      const response = await withRetry(async () => {
        if (shouldMockExternalApis()) {
          return { results: [], has_more: false, next_cursor: null };
        }
        
        const notion = getNotionClient();
        return await notion.databases.query({
          database_id: dbConfig.id,
          filter: {
            property: 'Last edited time',
            last_edited_time: {
              after: sinceDate.toISOString(),
            },
          },
          page_size: 100,
        });
      }, 3, 2000, 1.5); // 3 retries with exponential backoff
      
      if (response.results.length > 0) {
        console.log(`📥 Found ${response.results.length} updated records in ${dbConfig.name}`);
        
        const transformedRecords = response.results.map(page => 
          transformNotionPage(page, dbConfig.mapping)
        );
        
        await withRetry(() => 
          loadToPostgreSQL(transformedRecords, dbConfig.table, dbConfig.visibility),
          2, 1000
        );
        
        let processedCount = 0;
        let errorCount = 0;
        
        for (const record of transformedRecords) {
          try {
            await Promise.all([
              withRetry(() => loadToS3(record, dbConfig.table), 2, 1000),
              withRetry(() => loadToVectorDB(record, dbConfig.table, dbConfig.visibility), 2, 1000)
            ]);
            processedCount++;
          } catch (error) {
            console.error(`❌ Failed to process record ${record.notion_id}:`, {
              error: error instanceof Error ? error.message : 'Unknown error',
              recordId: record.notion_id,
              table: dbConfig.table
            });
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
  const startTime = Date.now();
  const results: Record<string, any> = {};
  let totalExtracted = 0;
  let totalLoaded = 0;
  let totalErrors = 0;
  let successfulDatabases = 0;
  let failedDatabases = 0;
  
  console.log(`🚀 Starting full ETL sync for ${NOTION_DATABASES.length} databases...`);
  
  // Pre-flight environment validation
  try {
    await validateETLEnvironment();
  } catch (error) {
    console.error('❌ Pre-flight validation failed:', error);
    return {
      _summary: {
        status: 'failed',
        error: 'Environment validation failed',
        details: error instanceof Error ? error.message : 'Unknown validation error',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      }
    };
  }
  
  for (const dbConfig of NOTION_DATABASES) {
    const dbStartTime = Date.now();
    try {
      console.log(`📊 Processing database: ${dbConfig.name} (${dbConfig.table})`);
      const result = await syncDatabase(dbConfig);
      results[dbConfig.name] = {
        ...result,
        duration: Date.now() - dbStartTime,
        status: 'success'
      };
      
      totalExtracted += result.extracted || 0;
      totalLoaded += result.loaded || 0;
      totalErrors += result.errors || 0;
      successfulDatabases++;
      
      console.log(`✅ ${dbConfig.name} completed: ${result.loaded}/${result.extracted} records processed with ${result.errors} errors`);
      
    } catch (error) {
      const dbDuration = Date.now() - dbStartTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error(`💥 Full sync failed for ${dbConfig.name}:`, {
        error: errorMessage,
        stack: errorStack,
        duration: dbDuration,
        database: dbConfig.name,
        table: dbConfig.table
      });
      
      results[dbConfig.name] = { 
        error: errorMessage,
        duration: dbDuration,
        status: 'failed',
        database: dbConfig.name,
        table: dbConfig.table,
        timestamp: new Date().toISOString()
      };
      
      failedDatabases++;
    }
  }
  
  const totalDuration = Date.now() - startTime;
  const overallStatus = failedDatabases === 0 ? 'success' : (successfulDatabases > 0 ? 'partial' : 'failed');
  
  console.log(`🎯 Full sync completed: ${successfulDatabases}/${NOTION_DATABASES.length} databases successful`);
  console.log(`📈 Total: ${totalLoaded}/${totalExtracted} records processed with ${totalErrors} errors in ${totalDuration}ms`);
  
  results._summary = {
    status: overallStatus,
    totalDatabases: NOTION_DATABASES.length,
    successfulDatabases,
    failedDatabases,
    totalExtracted,
    totalLoaded,
    totalErrors,
    duration: totalDuration,
    timestamp: new Date().toISOString(),
    performance: {
      recordsPerSecond: totalDuration > 0 ? Math.round((totalLoaded / totalDuration) * 1000) : 0,
      averageDbTime: NOTION_DATABASES.length > 0 ? Math.round(totalDuration / NOTION_DATABASES.length) : 0
    }
  };
  
  return results;
}
