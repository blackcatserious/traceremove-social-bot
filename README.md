# TraceRemove Digital Arthur Ziganshine System

This repository contains a comprehensive AI-powered digital assistant system with domain-specific personas, RAG capabilities, and full project implementation features.  
The bot pulls content from a Notion database, formats it into short posts with a philosophical tone and publishes them on a schedule to **X/Twitter**, **Facebook** and **Instagram**.  

## Features

* **Scheduled publishing** – Uses Vercel cron jobs to run once per hour and pick up any posts that are ready to publish.
* **Notion integration** – Reads posts from a Notion database with properties such as `Title`, `Summary`, `Status`, `Publish At`, `Platforms`, `Tags`, etc., and marks them as `Published` after successful posting.
* **Multi‑platform support** – Separate publishers for X/Twitter, Facebook, Instagram, and GitHub.  Dry‑run mode is enabled by default via the `BOT_DRY_RUN` environment variable.
* **Custom formatting** – Posts are assembled using a simple formatter or an optional OpenAI model to rewrite the summary in a “philosopher of technology” style.

## Getting started

1. **Clone this repo** and install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```
2. **Configure your environment variables** – copy `.env.example` to `.env` and fill out the required keys for Notion and the social networks.  See the file for details on each variable. You can verify your setup at any time with `npm run check:env`, which loads the same `.env*` files that Next.js would, prints the current validation mode, warnings, any missing variables, and returns a non-zero exit code if something is misconfigured.  For JSON output you can run `npm run check:env -- --json` (handy for CI pipelines). The checker also accepts one or more `--dotenv path/to/file` arguments to layer in specific env files and `--example` (optionally `--example path/to/example`) to validate that your example file lists every required variable without touching local secrets.  Pass `--strict` to force strict validation for that run or `--relaxed` to inject placeholders without toggling environment variables globally.
3. **Set up your Notion database** – create a database with the columns described in this README and share it with the integration token used in `NOTION_TOKEN`.
4. **Deploy on Vercel** – import the repository into Vercel.  The included `vercel.json` file schedules a cron job to hit `/api/cron/publish` every hour.

## Notion database schema

The application expects a Notion database with the following properties:

| Property        | Type          | Description                                           |
|-----------------|---------------|-------------------------------------------------------|
| **Title**       | Title         | The headline of the post                              |
| **Summary**     | Rich text     | A short summary of the content                        |
| **Status**      | Select        | One of `Draft`, `Ready`, `Scheduled`, `Published`     |
| **Publish At**  | Date          | Date/time at which the post should be published       |
| **Platforms**   | Multi‑select  | Which networks to publish to: `X`, `Facebook`, `Instagram`, `GitHub` |
| **Canonical URL** | URL         | Link to the full article                              |
| **Image URL**   | URL           | URL of an image to include (Instagram required)        |
| **Tags**        | Multi‑select  | Short tags used to build hashtags (e.g. `ethics`)      |
| **X Post ID** / **FB Post ID** / **IG Media ID** | Rich text | Fields filled in after publishing to record the platform IDs |

## Environment variables

The application reads configuration from environment variables.  Copy `.env.example` to `.env` and adjust the values:

```env
NOTION_TOKEN=your-notion-integration-secret
NOTION_DATABASE_ID=your-notion-database-id
NOTION_DB_REGISTRY=6d3da5a01186475d8c2b794cca147a86
NOTION_DB_CASES=25cef6a76fa5800b8241f8ed4cd3be33
NOTION_DB_FINANCE=25cef6a76fa580eb912ff8cfca54155e
NOTION_DB_PUBLISHING=402cc41633384d35b30ec1ab7c3185da

BOT_DRY_RUN=true
TIMEZONE=Europe/Belgrade

# Core data stores
PG_DSN=postgresql://user:password@host:5432/database
UPSTASH_VECTOR_REST_URL=https://xxxxx.upstash.io
UPSTASH_VECTOR_REST_TOKEN=

# Optional Upstash Redis cache (requires both values)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Environment validation controls
# Set ENFORCE_ENV_VALIDATION=true to force strict validation even if SKIP_ENV_VALIDATION is also set
# Set SKIP_ENV_VALIDATION=true to allow startup with placeholder values (development only)
# CI, Vercel CI, npm run build, and NODE_ENV=test default to relaxed validation – even when NODE_ENV=production – so automated and local builds can run without real secrets
# Relaxed mode injects deterministic placeholder secrets (e.g. a fake Postgres DSN) so automated builds remain safe
ENFORCE_ENV_VALIDATION=
SKIP_ENV_VALIDATION=

# X / Twitter
TWITTER_APP_KEY=
TWITTER_APP_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# Facebook
FB_PAGE_ID=
FB_ACCESS_TOKEN=

# Instagram
IG_BUSINESS_ACCOUNT_ID=
IG_ACCESS_TOKEN=

# OpenAI (optional)
OPENAI_API_KEY=
LLM_MODE=off

# Admin & automation
ADMIN_TOKEN=
CRON_SECRET=
REINDEX_TOKEN=

# Vector ETL webhook (optional)
ETL_WEBHOOK=

# GitHub integration
GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=
GITHUB_OWNER=blackcatserious
GITHUB_REPO=traceremove-social-bot
```

> **Tip:** Automated environments such as `CI=1`, `VERCEL_CI=1`, `NODE_ENV=test`, or the `npm run build` lifecycle automatically opt into relaxed validation with safe placeholder values so build pipelines (and local production builds) can execute without storing real secrets. Set `ENFORCE_ENV_VALIDATION=true` to require strict validation everywhere, or `SKIP_ENV_VALIDATION=true` locally when you want to bypass checks explicitly.

The `npm run check:env` helper now reports which variables received placeholder secrets and highlights partial configurations (for example, when only one of the Upstash Redis credentials is present, S3 storage is missing a key, or a social integration is only partially configured). If you set `BOT_DRY_RUN=false`, the validator also warns when no network has the full credential set required for live publishing so you can address the gaps before deploying. Use `--strict` or `--relaxed` flags on the CLI to force a one-off validation mode without mutating the surrounding shell environment.

In addition to missing variable checks, the validator inspects sensitive keys for common placeholder markers such as `changeme`, `replace-me`, `sample`, `example`, `insert-here`, `abc123`, or repeated characters/punctuation. When these markers or other obvious stand-ins appear in secrets or access tokens the checker emits a warning so you can swap in the real credential before deploying.

## Folder structure

```
traceremove-social-bot/
├── README.md             – this file
├── package.json          – project dependencies and scripts
├── tsconfig.json         – TypeScript configuration
├── next.config.mjs       – basic Next.js configuration
├── vercel.json           – cron schedule for Vercel
├── .env.example          – example environment file
└── src/
    ├── lib/              – helper libraries
    │   ├── notion.ts     – Notion API interactions
    │   ├── formatters.ts – simple post formatter
    │   ├── hashtags.ts   – tag normalisation helpers
    │   ├── limits.ts     – platform limits
    │   ├── llm.ts        – optional OpenAI integration
    │   ├── generator.ts  – orchestrates formatting and LLM
    │   └── publishers/
    │       ├── x.ts      – publish to X/Twitter
    │       ├── facebook.ts – publish to Facebook
    │       ├── instagram.ts – publish to Instagram
    │       └── github.ts – publish to GitHub
    └── app/
        └── api/
            ├── cron/
            │   └── publish/route.ts – scheduled publishing endpoint
            ├── publish/route.ts      – manual publishing endpoint
            ├── webhooks/
            │   └── github/route.ts   – GitHub webhook handler
            ├── chat/route.ts         – AI chatbot endpoint
            └── admin/
                └── reindex/route.ts  – RAG reindex endpoint
```
