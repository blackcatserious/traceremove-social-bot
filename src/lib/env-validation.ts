export interface EnvironmentConfig {
  openai: {
    apiKey: string;
  };
  multiModel: {
    anthropic?: string;
    google?: string;
    mistral?: string;
    groq?: string;
  };
  notion: {
    token: string;
    databases: {
      registry: string;
      cases: string;
      finance: string;
      publishing: string;
    };
  };
  database: {
    pgDsn: string;
    poolMin?: number;
    poolMax?: number;
  };
  vector: {
    qdrantUrl: string;
    qdrantApiKey: string;
    collectionName?: string;
    dimension?: number;
  };
  cache: {
    redisUrl?: string;
    redisToken?: string;
    ttlSearch?: number;
    ttlDatabase?: number;
    maxSize?: number;
  };
  security: {
    cronSecret: string;
    rateLimitRequests?: number;
    rateLimitWindow?: number;
  };
  monitoring: {
    logLevel?: string;
    logFormat?: string;
    enablePerformanceTracking?: boolean;
    enableHealthChecks?: boolean;
  };
  etl: {
    fullSyncInterval?: number;
    incrementalSyncInterval?: number;
    batchSize?: number;
    maxRetries?: number;
  };
  development: {
    debugMode?: boolean;
    mockExternalApis?: boolean;
    skipHealthChecks?: boolean;
  };
}

export class EnvironmentValidationError extends Error {
  constructor(message: string, public missingVars: string[]) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

export function validateEnvironment(): EnvironmentConfig {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  function getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      missingVars.push(key);
      return '';
    }
    return value;
  }

  function getOptional(key: string, defaultValue?: string): string | undefined {
    const value = process.env[key];
    if (!value && defaultValue !== undefined) {
      warnings.push(`${key} not set, using default: ${defaultValue}`);
      return defaultValue;
    }
    return value || undefined;
  }

  function getOptionalNumber(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (!value) {
      if (defaultValue !== undefined) {
        warnings.push(`${key} not set, using default: ${defaultValue}`);
        return defaultValue;
      }
      return undefined;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      warnings.push(`${key} is not a valid number, ignoring`);
      return defaultValue;
    }
    return parsed;
  }

  function getOptionalBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = process.env[key];
    if (!value) {
      if (defaultValue !== undefined) {
        warnings.push(`${key} not set, using default: ${defaultValue}`);
        return defaultValue;
      }
      return undefined;
    }
    return value.toLowerCase() === 'true';
  }

  const config: EnvironmentConfig = {
    openai: {
      apiKey: getRequired('OPENAI_API_KEY'),
    },
    multiModel: {
      anthropic: getOptional('ANTHROPIC_API_KEY'),
      google: getOptional('GOOGLE_API_KEY'),
      mistral: getOptional('MISTRAL_API_KEY'),
      groq: getOptional('GROQ_API_KEY'),
    },
    notion: {
      token: getRequired('NOTION_TOKEN'),
      databases: {
        registry: getRequired('NOTION_DB_REGISTRY'),
        cases: getRequired('NOTION_DB_CASES'),
        finance: getRequired('NOTION_DB_FINANCE'),
        publishing: getRequired('NOTION_DB_PUBLISHING'),
      },
    },
    database: {
      pgDsn: getRequired('PG_DSN'),
      poolMin: getOptionalNumber('PG_POOL_MIN', 2),
      poolMax: getOptionalNumber('PG_POOL_MAX', 20),
    },
    vector: {
      qdrantUrl: getRequired('QDRANT_URL'),
      qdrantApiKey: getRequired('QDRANT_API_KEY'),
      collectionName: getOptional('QDRANT_COLLECTION_NAME', 'traceremove_vectors'),
      dimension: getOptionalNumber('VECTOR_DIMENSION', 1536),
    },
    cache: {
      redisUrl: getOptional('UPSTASH_REDIS_REST_URL'),
      redisToken: getOptional('UPSTASH_REDIS_REST_TOKEN'),
      ttlSearch: getOptionalNumber('CACHE_TTL_SEARCH', 3600),
      ttlDatabase: getOptionalNumber('CACHE_TTL_DATABASE', 1800),
      maxSize: getOptionalNumber('CACHE_MAX_SIZE', 1000),
    },
    security: {
      cronSecret: getRequired('CRON_SECRET'),
      rateLimitRequests: getOptionalNumber('RATE_LIMIT_REQUESTS', 100),
      rateLimitWindow: getOptionalNumber('RATE_LIMIT_WINDOW', 60),
    },
    monitoring: {
      logLevel: getOptional('LOG_LEVEL', 'info'),
      logFormat: getOptional('LOG_FORMAT', 'json'),
      enablePerformanceTracking: getOptionalBoolean('ENABLE_PERFORMANCE_TRACKING', true),
      enableHealthChecks: getOptionalBoolean('ENABLE_HEALTH_CHECKS', true),
    },
    etl: {
      fullSyncInterval: getOptionalNumber('ETL_FULL_SYNC_INTERVAL', 1440),
      incrementalSyncInterval: getOptionalNumber('ETL_INCREMENTAL_SYNC_INTERVAL', 60),
      batchSize: getOptionalNumber('ETL_BATCH_SIZE', 100),
      maxRetries: getOptionalNumber('ETL_MAX_RETRIES', 3),
    },
    development: {
      debugMode: getOptionalBoolean('DEBUG_MODE', false),
      mockExternalApis: getOptionalBoolean('MOCK_EXTERNAL_APIS', false),
      skipHealthChecks: getOptionalBoolean('SKIP_HEALTH_CHECKS', false),
    },
  };

  if (warnings.length > 0 && config.development.debugMode) {
    console.warn('Environment validation warnings:', warnings);
  }

  if (missingVars.length > 0) {
    throw new EnvironmentValidationError(
      `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env.local file and ensure all required variables are set.`,
      missingVars
    );
  }

  return config;
}

export function getEnvironmentConfig(): EnvironmentConfig | null {
  try {
    return validateEnvironment();
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.error('Environment validation failed:', error.message);
      return null;
    }
    throw error;
  }
}

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function getLogLevel(): string {
  return process.env.LOG_LEVEL || 'info';
}

export function shouldEnableDebugMode(): boolean {
  return process.env.DEBUG_MODE === 'true';
}

export function shouldMockExternalApis(): boolean {
  return process.env.MOCK_EXTERNAL_APIS === 'true';
}

export function shouldSkipHealthChecks(): boolean {
  return process.env.SKIP_HEALTH_CHECKS === 'true';
}
