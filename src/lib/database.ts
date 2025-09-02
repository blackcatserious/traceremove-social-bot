import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.PG_DSN;
    if (!connectionString || connectionString.includes('placeholder') || connectionString === '') {
      throw new Error('PG_DSN environment variable is required. Please configure PostgreSQL connection string.');
    }
    
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]): Promise<any> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const startTime = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      console.warn(`🐌 Slow query detected (${duration}ms):`, text.substring(0, 100));
    } else if (duration > 500) {
      console.info(`⚠️  Moderate query time (${duration}ms):`, text.substring(0, 50));
    }
    
    try {
      const { performanceMonitor } = await import('./performance');
      performanceMonitor.recordQuery({
        query: text.substring(0, 100),
        duration,
        rows: result.rows?.length || 0,
        timestamp: new Date().toISOString(),
      });
      
      const { updateMetric } = await import('./monitoring');
      updateMetric('databaseConnections', pool.totalCount);
    } catch (perfError) {
      console.debug('Performance monitoring error:', perfError);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    console.error('📝 Query:', text.substring(0, 200));
    console.error('📊 Params:', params);
    
    try {
      const { updateHealthCheck } = await import('./monitoring');
      updateHealthCheck('PostgreSQL', 'unhealthy', undefined, error instanceof Error ? error.message : 'Query failed');
    } catch (monitoringError) {
      console.debug('Monitoring update failed:', monitoringError);
    }
    
    throw error;
  } finally {
    client.release();
  }
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

export const schema = {
  catalog: `
    CREATE TABLE IF NOT EXISTS catalog (
      id SERIAL PRIMARY KEY,
      notion_id VARCHAR(255) UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      topic VARCHAR(255),
      tags TEXT[],
      status VARCHAR(50),
      lang VARCHAR(10),
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      author VARCHAR(255),
      last_editor VARCHAR(255),
      visibility VARCHAR(20) DEFAULT 'public'
    );
    
    CREATE INDEX IF NOT EXISTS idx_catalog_status ON catalog(status);
    CREATE INDEX IF NOT EXISTS idx_catalog_lang ON catalog(lang);
    CREATE INDEX IF NOT EXISTS idx_catalog_visibility ON catalog(visibility);
    CREATE INDEX IF NOT EXISTS idx_catalog_topic ON catalog(topic);
    CREATE INDEX IF NOT EXISTS idx_catalog_updated_at ON catalog(updated_at);
  `,
  
  cases: `
    CREATE TABLE IF NOT EXISTS cases (
      id SERIAL PRIMARY KEY,
      notion_id VARCHAR(255) UNIQUE NOT NULL,
      name TEXT NOT NULL,
      date_start DATE,
      client_url TEXT,
      keys TEXT[],
      terms TEXT,
      status VARCHAR(50),
      price DECIMAL(10,2),
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      visibility VARCHAR(20) DEFAULT 'public'
    );
    
    CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
    CREATE INDEX IF NOT EXISTS idx_cases_date_start ON cases(date_start);
    CREATE INDEX IF NOT EXISTS idx_cases_visibility ON cases(visibility);
  `,
  
  publishing: `
    CREATE TABLE IF NOT EXISTS publishing (
      id SERIAL PRIMARY KEY,
      notion_id VARCHAR(255) UNIQUE NOT NULL,
      title TEXT NOT NULL,
      ownership VARCHAR(255),
      type VARCHAR(100),
      channel VARCHAR(255),
      pub_date DATE,
      venue TEXT,
      citation_style VARCHAR(100),
      submission_status VARCHAR(100),
      due_date DATE,
      doi TEXT,
      lang VARCHAR(10),
      tags TEXT[],
      notes TEXT,
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      visibility VARCHAR(20) DEFAULT 'public'
    );
    
    CREATE INDEX IF NOT EXISTS idx_publishing_due_date ON publishing(due_date);
    CREATE INDEX IF NOT EXISTS idx_publishing_pub_date ON publishing(pub_date);
    CREATE INDEX IF NOT EXISTS idx_publishing_status ON publishing(submission_status);
    CREATE INDEX IF NOT EXISTS idx_publishing_lang ON publishing(lang);
    CREATE INDEX IF NOT EXISTS idx_publishing_visibility ON publishing(visibility);
  `,
  
  finance: `
    CREATE TABLE IF NOT EXISTS finance (
      id SERIAL PRIMARY KEY,
      notion_id VARCHAR(255) UNIQUE NOT NULL,
      name TEXT NOT NULL,
      amount DECIMAL(10,2),
      notes TEXT,
      date_start DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      visibility VARCHAR(20) DEFAULT 'internal'
    );
    
    CREATE INDEX IF NOT EXISTS idx_finance_date_start ON finance(date_start);
    CREATE INDEX IF NOT EXISTS idx_finance_amount ON finance(amount);
    CREATE INDEX IF NOT EXISTS idx_finance_visibility ON finance(visibility);
  `
};

export async function initializeDatabase(): Promise<void> {
  try {
    await query(schema.catalog);
    await query(schema.cases);
    await query(schema.publishing);
    await query(schema.finance);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

export interface CatalogRecord {
  id: number;
  notion_id: string;
  title: string;
  summary?: string;
  content?: string;
  topic?: string;
  tags?: string[];
  status?: string;
  lang?: string;
  url?: string;
  created_at: Date;
  updated_at: Date;
  author?: string;
  last_editor?: string;
  visibility: 'public' | 'internal';
}

export interface CaseRecord {
  id: number;
  notion_id: string;
  name: string;
  date_start?: Date;
  client_url?: string;
  keys?: string[];
  terms?: string;
  status?: string;
  price?: number;
  url?: string;
  created_at: Date;
  updated_at: Date;
  visibility: 'public' | 'internal';
}

export interface PublishingRecord {
  id: number;
  notion_id: string;
  title: string;
  ownership?: string;
  type?: string;
  channel?: string;
  pub_date?: Date;
  venue?: string;
  citation_style?: string;
  submission_status?: string;
  due_date?: Date;
  doi?: string;
  lang?: string;
  tags?: string[];
  notes?: string;
  url?: string;
  created_at: Date;
  updated_at: Date;
  visibility: 'public' | 'internal';
}

export interface FinanceRecord {
  id: number;
  notion_id: string;
  name: string;
  amount?: number;
  notes?: string;
  date_start?: Date;
  created_at: Date;
  updated_at: Date;
  visibility: 'internal';
}
