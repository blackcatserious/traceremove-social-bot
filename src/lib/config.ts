export interface EnvironmentConfig {
  notion: {
    token: string;
    databases: {
      registry: string;
      cases: string;
      finance: string;
      publishing: string;
    };
  };
  ai: {
    openai: string;
    anthropic?: string;
    google?: string;
    mistral?: string;
    groq?: string;
    cohere?: string;
  };
  database: {
    postgresql: string;
    vector: {
      url: string;
      token: string;
    };
  };
  storage?: {
    endpoint: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
  };
  admin: {
    token: string;
    cronSecret: string;
  };
  orm: {
    defaultLang: string;
  };
}

export function validateEnvironment(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  const required = [
    'NOTION_TOKEN',
    'OPENAI_API_KEY',
    'PG_DSN',
    'UPSTASH_VECTOR_REST_URL',
    'UPSTASH_VECTOR_REST_TOKEN',
    'ADMIN_TOKEN'
  ];

  const optional = [
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY',
    'MISTRAL_API_KEY',
    'GROQ_API_KEY',
    'COHERE_API_KEY',
    'S3_ENDPOINT',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY'
  ];

  for (const key of required) {
    const value = process.env[key];
    if (!value || value.includes('your_') || value.includes('place') || value === '') {
      missing.push(key);
    }
  }

  for (const key of optional) {
    const value = process.env[key];
    if (!value || value.includes('your_') || value.includes('place') || value === '') {
      warnings.push(`${key} not configured - some features may be limited`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

export function getConfig(): EnvironmentConfig {
  const validation = validateEnvironment();
  
  if (!validation.valid) {
    throw new Error(`Missing required environment variables: ${validation.missing.join(', ')}`);
  }

  return {
    notion: {
      token: process.env.NOTION_TOKEN!,
      databases: {
        registry: process.env.NOTION_DB_REGISTRY || '6d3da5a01186475d8c2b794cca147a86',
        cases: process.env.NOTION_DB_CASES || '25cef6a76fa5800b8241f8ed4cd3be33',
        finance: process.env.NOTION_DB_FINANCE || '25cef6a76fa580eb912ff8cfca54155e',
        publishing: process.env.NOTION_DB_PUBLISHING || '402cc41633384d35b30ec1ab7c3185da',
      },
    },
    ai: {
      openai: process.env.OPENAI_API_KEY!,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      mistral: process.env.MISTRAL_API_KEY,
      groq: process.env.GROQ_API_KEY,
      cohere: process.env.COHERE_API_KEY,
    },
    database: {
      postgresql: process.env.PG_DSN!,
      vector: {
        url: process.env.UPSTASH_VECTOR_REST_URL!,
        token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
      },
    },
    storage: process.env.S3_ENDPOINT ? {
      endpoint: process.env.S3_ENDPOINT,
      bucket: process.env.S3_BUCKET || 'traceremove-content',
      accessKey: process.env.S3_ACCESS_KEY!,
      secretKey: process.env.S3_SECRET_KEY!,
    } : undefined,
    admin: {
      token: process.env.ADMIN_TOKEN!,
      cronSecret: process.env.CRON_SECRET || 'default-secret',
    },
    orm: {
      defaultLang: process.env.ORM_DEFAULT_LANG || 'en',
    },
  };
}
