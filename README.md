# traceremove-social-bot

This repository contains a Next.js 14 application designed to automate the process of publishing posts from a Notion database to multiple social media platforms.  
The bot pulls content from a Notion database, formats it into short posts with a philosophical tone and publishes them on a schedule to **X/Twitter**, **Facebook** and **Instagram**.  

## Features

* **Scheduled publishing** – Uses Vercel cron jobs to run once per hour and pick up any posts that are ready to publish.
* **Notion integration** – Reads posts from a Notion database with properties such as `Title`, `Summary`, `Status`, `Publish At`, `Platforms`, `Tags`, etc., and marks them as `Published` after successful posting.
* **Multi‑platform support** – Separate publishers for X/Twitter, Facebook and Instagram.  Dry‑run mode is enabled by default via the `BOT_DRY_RUN` environment variable.
* **Custom formatting** – Posts are assembled using a simple formatter or an optional OpenAI model to rewrite the summary in a "philosopher of technology" style.

## Getting started

1. **Clone this repo** and install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```
2. **Configure your environment variables** – copy `.env.example` to `.env` and fill out the required keys for Notion and the social networks.  See the file for details on each variable.
3. **Set up your Notion database** – create a database with the columns described in this README and share it with the integration token used in `NOTION_API_KEY`.
4. **Deploy on Vercel** – import the repository into Vercel.  The included `vercel.json` file schedules a cron job to hit `/api/cron/publish` every hour.

## Notion database schema

The application expects a Notion database with the following properties:

| Property        | Type          | Description                                           |
|-----------------|---------------|-------------------------------------------------------|
| **Title**       | Title         | The headline of the post                              |
| **Summary**     | Rich text     | A short summary of the content                        |
| **Status**      | Select        | One of `Draft`, `Ready`, `Scheduled`, `Published`     |
| **Publish At**  | Date          | Date/time at which the post should be published       |
| **Platforms**   | Multi‑select  | Which networks to publish to: `X`, `Facebook`, `Instagram` |
| **Canonical URL** | URL         | Link to the full article                              |
| **Image URL**   | URL           | URL of an image to include (Instagram required)        |
| **Tags**        | Multi‑select  | Short tags used to build hashtags (e.g. `ethics`)      |
| **X Post ID** / **FB Post ID** / **IG Media ID** | Rich text | Fields filled in after publishing to record the platform IDs |

## Environment variables

The application reads configuration from environment variables.  Copy `.env.example` to `.env` and adjust the values:

```env
NOTION_API_KEY=your-notion-integration-secret
NOTION_DATABASE_ID=your-notion-database-id

BOT_DRY_RUN=true
TIMEZONE=Europe/Belgrade

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
```

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
    │       └── instagram.ts – publish to Instagram
    └── app/
        └── api/
            ├── cron/
            │   └── publish/route.ts – scheduled publishing endpoint
            └── publish/route.ts      – manual publishing endpoint
```
