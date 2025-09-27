import nextEnv from '@next/env';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// @ts-ignore - the CLI runs directly via ts-node which requires the explicit .ts extension
import { getEnvironmentValidationSummary } from '../src/lib/env-validation.ts';

const { loadEnvConfig } = nextEnv;

type CliArgs = {
  json: boolean;
  dotenvFiles: string[];
  exampleFile?: string;
};

const BOOLEAN_FALSE_DEFAULTS = new Set([
  'CI',
  'VERCEL_CI',
  'SKIP_ENV_VALIDATION',
  'ENFORCE_ENV_VALIDATION',
]);

const BOOLEAN_TRUE_DEFAULTS = new Set([
  'BOT_DRY_RUN',
  'ENABLE_PERFORMANCE_TRACKING',
  'ENABLE_HEALTH_CHECKS',
]);

const NUMERIC_PLACEHOLDER_KEYS = new Set([
  'PG_POOL_MIN',
  'PG_POOL_MAX',
  'CACHE_TTL_SEARCH',
  'CACHE_TTL_DATABASE',
  'CACHE_MAX_SIZE',
  'VECTOR_DIMENSION',
  'CRON_POST_LIMIT',
  'ETL_FULL_SYNC_INTERVAL',
  'ETL_INCREMENTAL_SYNC_INTERVAL',
  'ETL_BATCH_SIZE',
  'ETL_MAX_RETRIES',
]);

function createPlaceholder(key: string): string {
  return `example-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { json: false, dotenvFiles: [] };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--json') {
      args.json = true;
      continue;
    }

    if (token === '-d' || token === '--dotenv') {
      const nextToken = argv[index + 1];
      if (!nextToken || nextToken.startsWith('-')) {
        throw new Error('Missing value for --dotenv');
      }
      args.dotenvFiles.push(nextToken);
      index += 1;
      continue;
    }

    if (token.startsWith('--dotenv=')) {
      const [, value] = token.split('=');
      args.dotenvFiles.push(value ?? '');
      continue;
    }

    if (token === '--example' || token === '--check-example') {
      const maybePath = argv[index + 1];
      if (maybePath && !maybePath.startsWith('-')) {
        args.exampleFile = maybePath;
        index += 1;
      } else {
        args.exampleFile = '.env.example';
      }
      continue;
    }

    if (token.startsWith('--example=')) {
      const [, value] = token.split('=');
      args.exampleFile = value && value.length > 0 ? value : '.env.example';
      continue;
    }

    if (token === '--help' || token === '-h') {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  if (args.dotenvFiles.some((file) => file.trim() === '')) {
    throw new Error('Missing value for --dotenv');
  }

  if (args.dotenvFiles.length > 0 && args.exampleFile) {
    throw new Error('Cannot combine --dotenv with --example. Choose one approach for loading environment variables.');
  }

  return args;
}

function printHelp(): void {
  console.log(`Usage: npm run check:env [-- --json] [-- --dotenv <path> ...] [-- --example [path]]\n\nOptions:\n  --json              Output results as JSON\n  --dotenv <path>     Load one or more additional env files on top of the standard Next.js resolution\n  --example [path]    Validate an example env file (defaults to .env.example) without touching local secrets\n  -h, --help          Show this help message`);
}

function resolveFilePath(target: string, projectDir: string): string {
  return path.isAbsolute(target) ? target : path.join(projectDir, target);
}

function assertFileExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Environment file not found: ${filePath}`);
  }
}

function loadEnvFile(filePath: string): Record<string, string> {
  const contents = fs.readFileSync(filePath, 'utf8');
  return dotenv.parse(contents);
}

function applyExamplePlaceholders(parsed: Record<string, string>): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { NODE_ENV: 'development' };
  for (const [key, value] of Object.entries(parsed)) {
    const trimmed = value?.trim() ?? '';
    if (trimmed.length > 0) {
      env[key] = value;
      continue;
    }

    if (BOOLEAN_FALSE_DEFAULTS.has(key)) {
      env[key] = 'false';
      continue;
    }

    if (BOOLEAN_TRUE_DEFAULTS.has(key)) {
      env[key] = 'true';
      continue;
    }

    if (NUMERIC_PLACEHOLDER_KEYS.has(key)) {
      env[key] = '1';
      continue;
    }

    env[key] = createPlaceholder(key);
  }
  for (const flag of BOOLEAN_FALSE_DEFAULTS) {
    if (!(flag in env)) {
      env[flag] = 'false';
    }
  }
  return env;
}

function prepareEnvironment(args: CliArgs): { env: NodeJS.ProcessEnv; loadedFiles: string[] } {
  const projectDir = process.cwd();
  const loaded = new Set<string>();

  if (args.exampleFile) {
    const examplePath = resolveFilePath(args.exampleFile, projectDir);
    assertFileExists(examplePath);
    const parsed = loadEnvFile(examplePath);
    const exampleEnv = applyExamplePlaceholders(parsed);
    loaded.add(path.relative(projectDir, examplePath));
    return { env: exampleEnv, loadedFiles: Array.from(loaded) };
  }

  const dev = process.env.NODE_ENV !== 'production';
  const { loadedEnvFiles } = loadEnvConfig(projectDir, dev);
  for (const file of loadedEnvFiles) {
    loaded.add(path.relative(projectDir, file.path));
  }

  const env: NodeJS.ProcessEnv = { ...process.env };

  if (args.dotenvFiles.length > 0) {
    for (const dotenvFile of args.dotenvFiles) {
      const envPath = resolveFilePath(dotenvFile, projectDir);
      assertFileExists(envPath);
      const parsed = loadEnvFile(envPath);
      Object.assign(env, parsed);
      loaded.add(path.relative(projectDir, envPath));
    }
  }

  return { env, loadedFiles: Array.from(loaded) };
}

function outputJson(summary: ReturnType<typeof getEnvironmentValidationSummary>, loadedFiles: string[]): void {
  const payload = {
    valid: summary.valid,
    mode: summary.mode,
    warnings: summary.warnings,
    missing: summary.missing,
    placeholdersUsed: summary.placeholders,
    loadedEnvFiles: loadedFiles,
  };
  console.log(JSON.stringify(payload, null, 2));
  if (!summary.valid) {
    process.exitCode = 1;
  }
}

function outputHuman(summary: ReturnType<typeof getEnvironmentValidationSummary>, loadedFiles: string[]): void {
  if (loadedFiles.length > 0) {
    console.log('Loaded environment files:');
    for (const file of loadedFiles) {
      console.log(`  • ${file}`);
    }
    console.log('');
  }

  const modeLabel = summary.mode.type === 'relaxed'
    ? `relaxed (${summary.mode.reason ?? 'no reason provided'})`
    : 'strict';

  console.log('Environment validation mode:', modeLabel);

  if (summary.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of summary.warnings) {
      console.log(`  • ${warning}`);
    }
  }

  if (summary.placeholders.length > 0) {
    console.log('\nPlaceholder values injected for:');
    for (const key of summary.placeholders) {
      console.log(`  • ${key}`);
    }
  }

  if (summary.missing.length > 0) {
    console.log('\nMissing variables:');
    for (const variable of summary.missing) {
      console.log(`  • ${variable}`);
    }
    console.log('\nEnvironment validation failed.');
    process.exitCode = 1;
  } else {
    console.log('\nAll required environment variables are set.');
  }
}

function main(): void {
  try {
    const args = parseArgs(process.argv);
    const { env, loadedFiles } = prepareEnvironment(args);
    const summary = getEnvironmentValidationSummary(env);

    if (args.json) {
      outputJson(summary, loadedFiles);
    } else {
      outputHuman(summary, loadedFiles);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

main();
