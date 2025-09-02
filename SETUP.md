# TraceRemove Comprehensive AI System Setup Guide

## Overview

This guide will help you configure the comprehensive AI system for traceremove.net with PostgreSQL, ETL pipeline, multi-model routing, and API endpoints.

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Notion workspace with integration token
- AI provider API keys (at minimum OpenAI)
- Upstash Vector database account

## Environment Configuration

### Required Variables

Copy `.env.example` to `.env.local` and configure the following required variables:

```bash
# Notion Integration
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AI Providers (OpenAI required, others optional)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# PostgreSQL Database
PG_DSN=postgresql://user:password@host:port/database

# Vector Database
UPSTASH_VECTOR_REST_URL=https://xxxxx.upstash.io
UPSTASH_VECTOR_REST_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin Access
ADMIN_TOKEN=your-secure-admin-token
```

### Optional Variables

```bash
# Additional AI Providers
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MISTRAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COHERE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# S3-Compatible Storage
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=traceremove-content
S3_ACCESS_KEY=AKIAXXXXXXXXXXXXXXXX
S3_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cron Authentication
CRON_SECRET=your-cron-secret
```

## Notion Database Setup

The system uses 4 Notion databases with predefined IDs:

1. **Registry** (`6d3da5a01186475d8c2b794cca147a86`) - Public knowledge base
2. **Cases** (`25cef6a76fa5800b8241f8ed4cd3be33`) - Client projects
3. **Finance** (`25cef6a76fa580eb912ff8cfca54155e`) - Internal financial data
4. **Publishing** (`402cc41633384d35b30ec1ab7c3185da`) - Academic publications

### Database Schema Requirements

Each database should have the following properties:

#### Registry Database
- **Name** (Title)
- **Краткое содержание** (Rich Text)
- **Content** (Rich Text)
- **Тематика** (Select)
- **Теги** (Multi-select)
- **Статус** (Select)
- **Язык** (Select)
- **URL** (URL)
- **Автор** (Person)
- **Последний редактор** (Person)

#### Cases Database
- **Name** (Title)
- **Дата запуска** (Date)
- **Клиенты:** (Rich Text)
- **Ключи** (Multi-select)
- **Сроки** (Rich Text)
- **Статус** (Select)
- **Стоимость** (Number)
- **url** (URL)

#### Publishing Database
- **Название** (Title)
- **Принадлежность** (Rich Text)
- **Тип** (Select)
- **Канал** (Rich Text)
- **Дата публикации** (Date)
- **Журнал** (Rich Text)
- **Формат цитирования** (Select)
- **Статус подачи** (Select)
- **Срок подачи** (Date)
- **DOI/Link** (URL)
- **Язык** (Select)
- **Теги** (Multi-select)
- **Краткое ТЗ** (Rich Text)
- **Ссылка** (URL)

#### Finance Database
- **Name** (Title)
- **Сумма** (Number)
- **Расход** (Rich Text)
- **Дата запуска** (Date)

## PostgreSQL Setup

1. Create a PostgreSQL database
2. The system will automatically create tables on first run
3. Ensure your connection string includes SSL if using a cloud provider

## Deployment

### Local Development

```bash
npm install
npm run build
npm run dev
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## API Endpoints

### Public Endpoints

- `GET /api/search?q=query&persona=public|internal` - Search with RAG
- `GET /api/publishing/upcoming?limit=10&days=30` - Upcoming publications
- `GET /api/system/status` - System status and health

### Admin Endpoints (require ADMIN_TOKEN)

- `POST /api/admin/reindex` - Trigger ETL sync
- `GET /api/system/health?detailed=true` - Detailed health checks
- `GET /api/system/metrics` - Performance metrics

## ETL Pipeline

The system automatically syncs data from Notion to PostgreSQL and vector database:

### Manual Sync
```bash
curl -X POST https://your-domain.com/api/admin/reindex \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "full"}'
```

### Incremental Sync
```bash
curl -X POST https://your-domain.com/api/admin/reindex \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "incremental"}'
```

## Multi-Model Routing

The system intelligently routes requests to different AI providers based on:

- **Intent**: qa, long, code, analysis
- **Content length**: Short vs long content
- **Persona**: Different models for different use cases

### Model Selection Logic

- **Short Q&A**: OpenAI GPT-4o-mini
- **Long content**: Anthropic Claude-3.5-Sonnet
- **Code tasks**: OpenAI GPT-4o-mini (low temperature)
- **Analysis**: OpenAI GPT-4o
- **Fallback**: Always falls back to OpenAI if other providers fail

## Monitoring

Access the admin dashboard at `/admin/monitoring` to view:

- System uptime and memory usage
- API response times
- Service health checks
- AI model usage statistics
- Database connection status

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PG_DSN format: `postgresql://user:password@host:port/database`
   - Check firewall settings for database access

2. **Notion API Errors**
   - Ensure integration has access to all 4 databases
   - Verify database IDs match the configured values

3. **Vector Database Issues**
   - Check Upstash Vector URL and token
   - Verify namespace permissions

4. **AI Provider Errors**
   - Validate API keys are active and have sufficient credits
   - Check rate limits and quotas

### Health Checks

Use the health endpoint to diagnose issues:

```bash
curl https://your-domain.com/api/system/health?detailed=true
```

### Logs

Monitor application logs in Vercel dashboard or your deployment platform for detailed error information.

## Security

- Keep all API keys secure and rotate regularly
- Use strong admin tokens
- Enable SSL/TLS for all database connections
- Restrict admin endpoint access to authorized users only

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review application logs
3. Test individual components using the health endpoints
4. Verify environment variable configuration
