export type ValidationMode =
  | { type: 'strict'; reason?: undefined }
  | { type: 'relaxed'; reason: string };

export interface EnvironmentConfig {
  notion: {
    token: string;
    legacyDatabaseId?: string;
    databases: {
      registry: string;
      cases: string;
      finance: string;
      publishing: string;
    };
  };
  rag: {
    sitemaps: {
      dev: string;
      com: string;
      io: string;
    };
  };
  openai: {
    apiKey: string;
    llmMode: string;
  };
  multiModel: {
    anthropic?: string;
    google?: string;
    mistral?: string;
    groq?: string;
    cohere?: string;
  };
  database: {
    pgDsn: string;
    poolMin?: number;
    poolMax?: number;
  };
  vector: {
    restUrl: string;
    restToken: string;
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
  storage?: {
    endpoint: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
  };
  security: {
    adminToken: string;
    cronSecret: string;
    reindexToken?: string;
    slackSigningSecret?: string;
    slackBotToken?: string;
    githubWebhookSecret?: string;
  };
  scheduler: {
    timezone: string;
    cronPostLimit: number;
  };
  github: {
    token?: string;
    owner: string;
    repo: string;
  };
  social: {
    dryRun: boolean;
    twitter: {
      appKey?: string;
      appSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    };
    facebook: {
      pageId?: string;
      accessToken?: string;
    };
    instagram: {
      businessAccountId?: string;
      accessToken?: string;
    };
  };
  monitoring: {
    logLevel: string;
    logFormat: string;
    enablePerformanceTracking: boolean;
    enableHealthChecks: boolean;
  };
  etl: {
    fullSyncInterval: number;
    incrementalSyncInterval: number;
    batchSize: number;
    maxRetries: number;
    webhook?: string;
  };
  development: {
    debugMode: boolean;
    mockExternalApis: boolean;
    skipHealthChecks: boolean;
  };
  orm: {
    defaultLanguage: string;
  };
  xai: {
    apiKey?: string;
  };
}

export interface EnvironmentValidationResult {
  config: EnvironmentConfig;
  missing: string[];
  warnings: string[];
  mode: ValidationMode;
  placeholders: string[];
}

export class EnvironmentValidationError extends Error {
  constructor(
    message: string,
    public missingVars: string[],
    public mode: ValidationMode,
    public warnings: string[]
  ) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

const RELAXED_PLACEHOLDERS: Record<string, string> = {
  PG_DSN: 'postgres://placeholder:placeholder@localhost:5432/placeholder',
  UPSTASH_VECTOR_REST_URL: 'https://example.upstash.io',
  UPSTASH_VECTOR_REST_TOKEN: 'placeholder-upstash-token',
  OPENAI_API_KEY: 'placeholder-openai-api-key',
  NOTION_TOKEN: 'placeholder-notion-token',
  NOTION_DB_REGISTRY: 'placeholder-registry-db',
  NOTION_DB_CASES: 'placeholder-cases-db',
  NOTION_DB_FINANCE: 'placeholder-finance-db',
  NOTION_DB_PUBLISHING: 'placeholder-publishing-db',
  ADMIN_TOKEN: 'placeholder-admin-token',
  CRON_SECRET: 'placeholder-cron-secret',
};

function isTruthy(value?: string): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
}

export type EnvSource = NodeJS.ProcessEnv;

function determineValidationMode(env: EnvSource): ValidationMode {
  const enforcementRequested = isTruthy(env.ENFORCE_ENV_VALIDATION);
  const skipRequested = isTruthy(env.SKIP_ENV_VALIDATION);
  const runningInCi = isTruthy(env.CI) || isTruthy(env.VERCEL_CI);
  const nodeEnv = (env.NODE_ENV ?? 'development').toLowerCase();
  const lifecycleEvent = env.npm_lifecycle_event;

  if (enforcementRequested) {
    return { type: 'strict' };
  }

  if (skipRequested) {
    return { type: 'relaxed', reason: 'SKIP_ENV_VALIDATION is enabled' };
  }

  if (runningInCi) {
    const reasonSuffix = nodeEnv === 'production' ? ' with NODE_ENV=production' : '';
    return {
      type: 'relaxed',
      reason: `a CI environment${reasonSuffix} was detected`,
    };
  }

  if (lifecycleEvent === 'build') {
    return { type: 'relaxed', reason: 'npm lifecycle event "build" is running' };
  }

  if (nodeEnv === 'production') {
    return { type: 'strict' };
  }

  if (nodeEnv === 'test') {
    return { type: 'relaxed', reason: 'NODE_ENV=test' };
  }

  return { type: 'strict' };
}

export function performEnvironmentValidation(env: EnvSource = process.env): EnvironmentValidationResult {
  const missingVars: string[] = [];
  const warnings: string[] = [];
  const placeholdersUsed: string[] = [];
  const enforcementRequested = isTruthy(env.ENFORCE_ENV_VALIDATION);
  const skipRequested = isTruthy(env.SKIP_ENV_VALIDATION);
  const runningInCi = isTruthy(env.CI) || isTruthy(env.VERCEL_CI);
  const nodeEnv = (env.NODE_ENV ?? 'development').toLowerCase();
  const lifecycleEvent = env.npm_lifecycle_event;

  const mode = determineValidationMode(env);
  const relaxedReason = mode.type === 'relaxed' ? mode.reason : undefined;

  if (enforcementRequested && skipRequested) {
    warnings.push(
      'Both ENFORCE_ENV_VALIDATION and SKIP_ENV_VALIDATION are set; enforcing strict validation to honour ENFORCE_ENV_VALIDATION.'
    );
  } else if (
    mode.type === 'relaxed' &&
    runningInCi &&
    nodeEnv === 'production' &&
    !skipRequested &&
    !enforcementRequested
  ) {
    warnings.push(
      'CI environment detected with NODE_ENV=production; relaxed validation is enabled so build pipelines can proceed. Set ENFORCE_ENV_VALIDATION=true to require real secrets.'
    );
  } else if (
    mode.type === 'relaxed' &&
    lifecycleEvent === 'build' &&
    nodeEnv === 'production' &&
    !runningInCi &&
    !skipRequested &&
    !enforcementRequested
  ) {
    warnings.push(
      'npm run build detected with NODE_ENV=production; relaxed validation is enabled during compilation. Set ENFORCE_ENV_VALIDATION=true to prevent placeholder secrets in local builds.'
    );
  }

  function createPlaceholder(key: string): string {
    return RELAXED_PLACEHOLDERS[key] ?? `placeholder-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  function recordMissing(key: string): void {
    if (!env[key]) {
      missingVars.push(key);
    }
  }

  function getRequired(key: string, fallback?: string): string {
    const value = env[key];
    if (!value) {
      recordMissing(key);
      if (mode.type === 'strict') {
        return fallback ?? '';
      }

      const resolvedFallback = fallback ?? createPlaceholder(key);
      const reason = relaxedReason ?? 'environment validation is running in relaxed mode';
      warnings.push(
        `${key} not set – using ${resolvedFallback ? 'a placeholder value' : 'an empty string'} because ${reason}.`
      );
      if (resolvedFallback) {
        placeholdersUsed.push(key);
      }
      return resolvedFallback;
    }
    return value;
  }

  function getOptional(key: string): string | undefined {
    const value = env[key];
    return value && value !== '' ? value : undefined;
  }

  function getOptionalNumber(key: string, defaultValue?: number): number | undefined {
    const value = env[key];
    if (!value) {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      warnings.push(`${key} is not a valid number, ignoring`);
      return defaultValue;
    }
    return parsed;
  }

  function getBoolean(key: string, defaultValue: boolean): boolean {
    const value = env[key];
    if (!value) {
      return defaultValue;
    }
    return isTruthy(value);
  }

  const storageEndpoint = getOptional('S3_ENDPOINT');
  const storageAccessKey = getOptional('S3_ACCESS_KEY');
  const storageSecretKey = getOptional('S3_SECRET_KEY');
  const storageBucket = getOptional('S3_BUCKET') ?? 'traceremove-content';

  const providedStorageKeys = [storageEndpoint, storageAccessKey, storageSecretKey].filter(Boolean).length;
  if (providedStorageKeys > 0 && providedStorageKeys < 3) {
    const missingKeys = [
      storageEndpoint ? null : 'S3_ENDPOINT',
      storageAccessKey ? null : 'S3_ACCESS_KEY',
      storageSecretKey ? null : 'S3_SECRET_KEY',
    ]
      .filter((key): key is string => key !== null)
      .join(', ');
    warnings.push(
      `Partial S3 configuration detected; missing ${missingKeys}. Object storage integration will remain disabled until all required credentials are provided.`
    );
  }

  if (storageBucket && providedStorageKeys === 0 && (env.S3_BUCKET ?? '').length > 0) {
    warnings.push(
      'S3_BUCKET is set without other S3 credentials; the custom bucket value will be ignored until endpoint and access keys are configured.'
    );
  }

  const redisRestUrl = getOptional('UPSTASH_REDIS_REST_URL');
  const redisRestToken = getOptional('UPSTASH_REDIS_REST_TOKEN');

  if ((redisRestUrl && !redisRestToken) || (!redisRestUrl && redisRestToken)) {
    warnings.push(
      'Partial Upstash Redis configuration detected; both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required to enable caching.'
    );
  }

  const slackSigningSecret = getOptional('SLACK_SIGNING_SECRET');
  const slackBotToken = getOptional('SLACK_BOT_TOKEN');

  if ((slackSigningSecret ? 1 : 0) + (slackBotToken ? 1 : 0) === 1) {
    const missingSlackKey = slackSigningSecret ? 'SLACK_BOT_TOKEN' : 'SLACK_SIGNING_SECRET';
    warnings.push(
      `Partial Slack configuration detected; missing ${missingSlackKey}. Slack alerts will remain disabled until both credentials are provided.`
    );
  }

  const twitterCredentials: Array<[string, string | undefined]> = [
    ['TWITTER_APP_KEY', getOptional('TWITTER_APP_KEY')],
    ['TWITTER_APP_SECRET', getOptional('TWITTER_APP_SECRET')],
    ['TWITTER_ACCESS_TOKEN', getOptional('TWITTER_ACCESS_TOKEN')],
    ['TWITTER_ACCESS_SECRET', getOptional('TWITTER_ACCESS_SECRET')],
  ];
  const providedTwitterKeys = twitterCredentials.filter(([, value]) => Boolean(value)).map(([key]) => key);
  const missingTwitterKeys = twitterCredentials.filter(([, value]) => !value).map(([key]) => key);
  if (providedTwitterKeys.length > 0 && missingTwitterKeys.length > 0) {
    warnings.push(
      `Partial Twitter configuration detected; missing ${missingTwitterKeys.join(', ')}. Posting to X/Twitter requires all credentials.`
    );
  }

  const facebookPageId = getOptional('FB_PAGE_ID');
  const facebookAccessToken = getOptional('FB_ACCESS_TOKEN');
  if ((facebookPageId ? 1 : 0) + (facebookAccessToken ? 1 : 0) === 1) {
    const missingFacebookKey = facebookPageId ? 'FB_ACCESS_TOKEN' : 'FB_PAGE_ID';
    warnings.push(
      `Partial Facebook configuration detected; missing ${missingFacebookKey}. Facebook publishing remains disabled until both are supplied.`
    );
  }

  const instagramBusinessAccountId = getOptional('IG_BUSINESS_ACCOUNT_ID');
  const instagramAccessToken = getOptional('IG_ACCESS_TOKEN');
  if ((instagramBusinessAccountId ? 1 : 0) + (instagramAccessToken ? 1 : 0) === 1) {
    const missingInstagramKey = instagramBusinessAccountId ? 'IG_ACCESS_TOKEN' : 'IG_BUSINESS_ACCOUNT_ID';
    warnings.push(
      `Partial Instagram configuration detected; missing ${missingInstagramKey}. Instagram publishing remains disabled until both are supplied.`
    );
  }

  const botDryRun = getBoolean('BOT_DRY_RUN', true);

  const twitterReady = missingTwitterKeys.length === 0 && providedTwitterKeys.length === twitterCredentials.length;
  const facebookReady = Boolean(facebookPageId && facebookAccessToken);
  const instagramReady = Boolean(instagramBusinessAccountId && instagramAccessToken);

  if (!botDryRun) {
    if (!twitterReady) {
      warnings.push(
        'BOT_DRY_RUN is disabled but Twitter credentials are incomplete. Provide all four Twitter keys before enabling live posting.'
      );
    }

    if (!facebookReady) {
      warnings.push(
        'BOT_DRY_RUN is disabled but Facebook credentials are incomplete. Provide both FB_PAGE_ID and FB_ACCESS_TOKEN to enable publishing.'
      );
    }

    if (!instagramReady) {
      warnings.push(
        'BOT_DRY_RUN is disabled but Instagram credentials are incomplete. Provide both IG_BUSINESS_ACCOUNT_ID and IG_ACCESS_TOKEN to enable publishing.'
      );
    }

    if (!twitterReady && !facebookReady && !instagramReady) {
      warnings.push(
        'BOT_DRY_RUN is disabled, but no social integration is fully configured. The bot will remain in dry-run mode effectively until at least one platform has complete credentials.'
      );
    }
  }

  const config: EnvironmentConfig = {
    notion: {
      token: getRequired('NOTION_TOKEN'),
      legacyDatabaseId: getOptional('NOTION_DATABASE_ID'),
      databases: {
        registry: getRequired('NOTION_DB_REGISTRY'),
        cases: getRequired('NOTION_DB_CASES'),
        finance: getRequired('NOTION_DB_FINANCE'),
        publishing: getRequired('NOTION_DB_PUBLISHING'),
      },
    },
    rag: {
      sitemaps: {
        dev: env.SITEMAP_DEV || 'https://traceremove.dev/sitemap.xml',
        com: env.SITEMAP_COM || 'https://traceremove.com/sitemap.xml',
        io: env.SITEMAP_IO || 'https://traceremove.io/sitemap.xml',
      },
    },
    openai: {
      apiKey: getRequired('OPENAI_API_KEY'),
      llmMode: env.LLM_MODE || 'off',
    },
    multiModel: {
      anthropic: getOptional('ANTHROPIC_API_KEY'),
      google: getOptional('GOOGLE_API_KEY'),
      mistral: getOptional('MISTRAL_API_KEY'),
      groq: getOptional('GROQ_API_KEY'),
      cohere: getOptional('COHERE_API_KEY'),
    },
    database: {
      pgDsn: getRequired('PG_DSN'),
      poolMin: getOptionalNumber('PG_POOL_MIN', 2),
      poolMax: getOptionalNumber('PG_POOL_MAX', 20),
    },
    vector: {
      restUrl: getRequired('UPSTASH_VECTOR_REST_URL'),
      restToken: getRequired('UPSTASH_VECTOR_REST_TOKEN'),
      collectionName: getOptional('UPSTASH_VECTOR_COLLECTION_NAME'),
      dimension: getOptionalNumber('VECTOR_DIMENSION', 1536),
    },
    cache: {
      redisUrl: redisRestUrl,
      redisToken: redisRestToken,
      ttlSearch: getOptionalNumber('CACHE_TTL_SEARCH', 3600),
      ttlDatabase: getOptionalNumber('CACHE_TTL_DATABASE', 1800),
      maxSize: getOptionalNumber('CACHE_MAX_SIZE', 1000),
    },
    storage:
      storageEndpoint && storageAccessKey && storageSecretKey
        ? {
            endpoint: storageEndpoint,
            bucket: storageBucket,
            accessKey: storageAccessKey,
            secretKey: storageSecretKey,
          }
        : undefined,
    security: {
      adminToken: getRequired('ADMIN_TOKEN'),
      cronSecret: getRequired('CRON_SECRET'),
      reindexToken: getOptional('REINDEX_TOKEN'),
      slackSigningSecret,
      slackBotToken,
      githubWebhookSecret: getOptional('GITHUB_WEBHOOK_SECRET'),
    },
    scheduler: {
      timezone: env.TIMEZONE || 'UTC',
      cronPostLimit: getOptionalNumber('CRON_POST_LIMIT', 5) ?? 5,
    },
    github: {
      token: getOptional('GITHUB_TOKEN'),
      owner: env.GITHUB_OWNER || 'blackcatserious',
      repo: env.GITHUB_REPO || 'traceremove-social-bot',
    },
    social: {
      dryRun: botDryRun,
      twitter: {
        appKey: twitterCredentials[0][1],
        appSecret: twitterCredentials[1][1],
        accessToken: twitterCredentials[2][1],
        accessSecret: twitterCredentials[3][1],
      },
      facebook: {
        pageId: facebookPageId,
        accessToken: facebookAccessToken,
      },
      instagram: {
        businessAccountId: instagramBusinessAccountId,
        accessToken: instagramAccessToken,
      },
    },
    monitoring: {
      logLevel: env.LOG_LEVEL || 'info',
      logFormat: env.LOG_FORMAT || 'json',
      enablePerformanceTracking: getBoolean('ENABLE_PERFORMANCE_TRACKING', true),
      enableHealthChecks: getBoolean('ENABLE_HEALTH_CHECKS', true),
    },
    etl: {
      fullSyncInterval: getOptionalNumber('ETL_FULL_SYNC_INTERVAL', 1440) ?? 1440,
      incrementalSyncInterval: getOptionalNumber('ETL_INCREMENTAL_SYNC_INTERVAL', 60) ?? 60,
      batchSize: getOptionalNumber('ETL_BATCH_SIZE', 100) ?? 100,
      maxRetries: getOptionalNumber('ETL_MAX_RETRIES', 3) ?? 3,
      webhook: getOptional('ETL_WEBHOOK'),
    },
    development: {
      debugMode: getBoolean('DEBUG_MODE', false),
      mockExternalApis: getBoolean('MOCK_EXTERNAL_APIS', false),
      skipHealthChecks: getBoolean('SKIP_HEALTH_CHECKS', false),
    },
    orm: {
      defaultLanguage: env.ORM_DEFAULT_LANG || 'en',
    },
    xai: {
      apiKey: getOptional('XAI_API_KEY'),
    },
  };

  return { config, missing: missingVars, warnings, mode, placeholders: placeholdersUsed };
}

export function validateEnvironment(env: EnvSource = process.env): EnvironmentConfig {
  const result = performEnvironmentValidation(env);
  if (result.warnings.length > 0 && (result.mode.type === 'relaxed' || result.config.development.debugMode === true)) {
    console.warn('Environment validation warnings:', result.warnings);
  }
  if (result.placeholders.length > 0 && result.mode.type === 'relaxed') {
    const context = result.mode.reason ? ` (${result.mode.reason})` : '';
    console.warn(
      `Environment placeholders were used${context}. Substitute real secrets for:`,
      result.placeholders
    );
  }
  if (result.missing.length > 0 && result.mode.type === 'relaxed') {
    const context = result.mode.reason ? ` (${result.mode.reason})` : '';
    console.warn(
      `Environment validation running in relaxed mode${context}. Proceeding with placeholder values for:`,
      result.missing
    );
  }
  if (result.missing.length > 0 && result.mode.type === 'strict') {
    throw new EnvironmentValidationError(
      `Missing required environment variables: ${result.missing.join(', ')}. Please check your .env.local file and ensure all required variables are set.`,
      result.missing,
      result.mode,
      result.warnings
    );
  }
  return result.config;
}

export function getEnvironmentValidationSummary(env: EnvSource = process.env): {
  valid: boolean;
  missing: string[];
  warnings: string[];
  mode: ValidationMode;
  placeholders: string[];
} {
  const result = performEnvironmentValidation(env);
  return {
    valid: result.missing.length === 0,
    missing: result.missing,
    warnings: result.warnings,
    mode: result.mode,
    placeholders: result.placeholders,
  };
}

export function getEnvironmentConfig(env: EnvSource = process.env): EnvironmentConfig {
  try {
    return validateEnvironment(env);
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.error('Environment validation failed:', error.message);
    }
    throw error;
  }
}

export function isProductionEnvironment(env: EnvSource = process.env): boolean {
  return (env.NODE_ENV ?? 'development') === 'production';
}

export function isDevelopmentEnvironment(env: EnvSource = process.env): boolean {
  return (env.NODE_ENV ?? 'development') === 'development';
}

export function getLogLevel(env: EnvSource = process.env): string {
  return env.LOG_LEVEL || 'info';
}

export function shouldEnableDebugMode(env: EnvSource = process.env): boolean {
  return isTruthy(env.DEBUG_MODE);
}

export function shouldMockExternalApis(env: EnvSource = process.env): boolean {
  return isTruthy(env.MOCK_EXTERNAL_APIS);
}

export function shouldSkipHealthChecks(env: EnvSource = process.env): boolean {
  return isTruthy(env.SKIP_HEALTH_CHECKS);
}
