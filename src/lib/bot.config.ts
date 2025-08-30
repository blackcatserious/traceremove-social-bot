export interface BotPersona {
  id: string;
  domain: string;
  languages: string[];
  defaultLanguage: string;
  systemPrompt: string;
  chatTitle: string;
  chatSubtitle: string;
  notionDbId: string;
  sitemapUrl: string;
  crawl?: {
    sitemap: string;
    enabled: boolean;
  };
}

export const PERSONAS: Record<string, BotPersona> = {
  'traceremove.dev': {
    id: 'philosopher',
    domain: 'traceremove.dev',
    languages: ['en'],
    defaultLanguage: 'en',
    systemPrompt: `You are a Philosopher of Technology for traceremove.dev. You respond calmly and thoughtfully, without clichés or emojis. Your focus is on the intersection of technology and humanity, ethics, architecture, and consequences. You explore deep questions about how technology shapes society and human experience. Provide philosophical insights while remaining accessible and practical.`,
    chatTitle: 'Philosophy of Technology',
    chatSubtitle: 'Exploring tech & humanity',
    notionDbId: process.env.NOTION_DEV_DB || '',
    sitemapUrl: process.env.SITEMAP_DEV || 'https://traceremove.dev/sitemap.xml',
    crawl: {
      sitemap: process.env.SITEMAP_DEV || 'https://traceremove.dev/sitemap.xml',
      enabled: true
    }
  },
  'traceremove.com': {
    id: 'orm-multilang',
    domain: 'traceremove.com',
    languages: ['en', 'es', 'tr'],
    defaultLanguage: process.env.ORM_DEFAULT_LANG || 'en',
    systemPrompt: `You are an ORM (Online Reputation Management) and Brand Reputation Assistant for Traceremove. You respond professionally and ethically, helping with reviews management, PR strategies, localization, and publication planning. You provide expert advice on brand reputation, crisis management, and digital presence optimization.`,
    chatTitle: 'Reputation Assistant',
    chatSubtitle: 'Brand & ORM expertise',
    notionDbId: process.env.NOTION_COM_DB || '',
    sitemapUrl: process.env.SITEMAP_COM || 'https://traceremove.com/sitemap.xml',
    crawl: {
      sitemap: process.env.SITEMAP_COM || 'https://traceremove.com/sitemap.xml',
      enabled: true
    }
  },
  'traceremove.io': {
    id: 'orm-russian',
    domain: 'traceremove.io',
    languages: ['ru'],
    defaultLanguage: 'ru',
    systemPrompt: `Вы ORM-ассистент для Traceremove. Отвечайте по-русски, профессионально, кратко и по делу. Помогайте с управлением репутацией, отзывами, PR-стратегиями и планированием публикаций. Предоставляйте экспертные советы по репутации бренда и цифровому присутствию.`,
    chatTitle: 'ORM Ассистент',
    chatSubtitle: 'Управление репутацией',
    notionDbId: process.env.NOTION_IO_DB || '',
    sitemapUrl: process.env.SITEMAP_IO || 'https://traceremove.io/sitemap.xml',
    crawl: {
      sitemap: process.env.SITEMAP_IO || 'https://traceremove.io/sitemap.xml',
      enabled: true
    }
  }
};

export function getPersonaByHost(host: string): BotPersona {
  const domain = host.replace(/^www\./, '').split(':')[0];
  
  const persona = PERSONAS[domain];
  if (persona) {
    return persona;
  }
  
  return PERSONAS['traceremove.com'];
}

export function detectLanguage(message: string, supportedLanguages: string[]): string {
  const cyrillicPattern = /[а-яё]/i;
  const turkishPattern = /[çğıöşü]/i;
  const spanishPattern = /[ñáéíóúü]/i;
  
  if (supportedLanguages.includes('ru') && cyrillicPattern.test(message)) {
    return 'ru';
  }
  
  if (supportedLanguages.includes('tr') && turkishPattern.test(message)) {
    return 'tr';
  }
  
  if (supportedLanguages.includes('es') && spanishPattern.test(message)) {
    return 'es';
  }
  
  return supportedLanguages[0] || 'en';
}
