import nextEnv from '@next/env';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

// @ts-ignore - the CLI runs directly via ts-node which requires the explicit .ts extension
import { getEnvironmentValidationSummary } from '../src/lib/env-validation.ts';
// @ts-ignore - type-only import retains the explicit extension for ts-node
import type { IntegrationSummaryEntry } from '../src/lib/env-validation.ts';

const { loadEnvConfig } = nextEnv;

type ValidationOverride = 'strict' | 'relaxed';

type CliArgs = {
  json: boolean;
  dotenvFiles: string[];
  exampleFile?: string;
  modeOverride?: ValidationOverride;
  failOnWarnings: boolean;
  outputPath?: string;
  requireOptional: boolean;
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

function formatPercentage(value: number): string {
  if (!Number.isFinite(value)) {
    return '0%';
  }
  return value % 1 === 0 ? `${value.toFixed(0)}%` : `${value.toFixed(1)}%`;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    json: false,
    dotenvFiles: [],
    failOnWarnings: false,
    requireOptional: false,
  };
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

    if (token === '--strict') {
      if (args.modeOverride === 'relaxed') {
        throw new Error('Cannot combine --strict with --relaxed');
      }
      args.modeOverride = 'strict';
      continue;
    }

    if (token === '--relaxed') {
      if (args.modeOverride === 'strict') {
        throw new Error('Cannot combine --relaxed with --strict');
      }
      args.modeOverride = 'relaxed';
      continue;
    }

    if (token === '--fail-on-warnings' || token === '--fail-on-warning') {
      args.failOnWarnings = true;
      continue;
    }

    if (
      token === '--require-optional' ||
      token === '--require-optionals' ||
      token === '--require-all-optional'
    ) {
      args.requireOptional = true;
      continue;
    }

    if (token === '--output' || token === '-o') {
      const nextToken = argv[index + 1];
      if (!nextToken || nextToken.startsWith('-')) {
        throw new Error('Missing value for --output');
      }
      args.outputPath = nextToken;
      index += 1;
      continue;
    }

    if (token.startsWith('--output=')) {
      const [, value] = token.split('=');
      if (!value) {
        throw new Error('Missing value for --output');
      }
      args.outputPath = value;
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

  if (args.outputPath && args.outputPath.trim() === '') {
    throw new Error('Missing value for --output');
  }

  return args;
}

function printHelp(): void {
  console.log(
    `Usage: npm run check:env [-- --json] [-- --dotenv <path> ...] [-- --example [path]] [-- --strict|--relaxed]\n\nOptions:\n  --json              Output results as JSON\n  --dotenv <path>     Load one or more additional env files on top of the standard Next.js resolution\n  --example [path]    Validate an example env file (defaults to .env.example) without touching local secrets\n  --strict            Force strict validation (sets ENFORCE_ENV_VALIDATION=true for the run)\n  --relaxed           Force relaxed validation (sets SKIP_ENV_VALIDATION=true for the run)\n  --fail-on-warnings  Exit with a non-zero status code if validation warnings are present\n  --require-optional  Treat optional integrations as required and fail if any are not ready\n  --output <path>     Write the JSON summary payload to a file (useful for CI artifacts)\n  -h, --help          Show this help message`
  );
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

function applyValidationOverride(env: NodeJS.ProcessEnv, override?: ValidationOverride): void {
  if (!override) {
    return;
  }

  if (override === 'strict') {
    env.ENFORCE_ENV_VALIDATION = 'true';
    env.SKIP_ENV_VALIDATION = 'false';
  } else {
    env.ENFORCE_ENV_VALIDATION = 'false';
    env.SKIP_ENV_VALIDATION = 'true';
  }
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
    applyValidationOverride(exampleEnv, args.modeOverride);
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

  applyValidationOverride(env, args.modeOverride);

  return { env, loadedFiles: Array.from(loaded) };
}

function createSummaryPayload(
  summary: ReturnType<typeof getEnvironmentValidationSummary>,
  loadedFiles: string[],
  failOnWarnings: boolean,
  generatedAt: string,
  durationMs: number,
  optionalFailures: IntegrationSummaryEntry[],
  requireOptional: boolean
) {
  return {
    valid: summary.valid,
    mode: summary.mode,
    warnings: summary.warnings,
    missing: summary.missing,
    placeholdersUsed: summary.placeholders,
    integrations: summary.integrations,
    integrationStats: summary.integrationStats,
    loadedEnvFiles: loadedFiles,
    failedDueToWarnings: failOnWarnings && summary.warnings.length > 0,
    optionalIntegrationsRequired: requireOptional,
    failedDueToOptionalRequirements: requireOptional && optionalFailures.length > 0,
    missingOptionalIntegrations: requireOptional
      ? optionalFailures.map((integration) => ({
          key: integration.key,
          label: integration.label,
          status: integration.status,
          missing: integration.missing,
          placeholders: integration.placeholders,
        }))
      : [],
    generatedAt,
    durationMs,
  };
}

function outputJson(
  summary: ReturnType<typeof getEnvironmentValidationSummary>,
  loadedFiles: string[],
  failOnWarnings: boolean,
  generatedAt: string,
  durationMs: number,
  optionalFailures: IntegrationSummaryEntry[],
  requireOptional: boolean
): void {
  const payload = createSummaryPayload(
    summary,
    loadedFiles,
    failOnWarnings,
    generatedAt,
    durationMs,
    optionalFailures,
    requireOptional
  );
  console.log(JSON.stringify(payload, null, 2));
  if (
    !summary.valid ||
    (failOnWarnings && summary.warnings.length > 0) ||
    (requireOptional && optionalFailures.length > 0)
  ) {
    process.exitCode = 1;
  }
}

function writeSummaryToFile(
  outputPath: string,
  summary: ReturnType<typeof getEnvironmentValidationSummary>,
  loadedFiles: string[],
  failOnWarnings: boolean,
  generatedAt: string,
  durationMs: number,
  optionalFailures: IntegrationSummaryEntry[],
  requireOptional: boolean
): void {
  const projectDir = process.cwd();
  const resolvedPath = resolveFilePath(outputPath, projectDir);
  const payload = createSummaryPayload(
    summary,
    loadedFiles,
    failOnWarnings,
    generatedAt,
    durationMs,
    optionalFailures,
    requireOptional
  );
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function outputHuman(
  summary: ReturnType<typeof getEnvironmentValidationSummary>,
  loadedFiles: string[],
  failOnWarnings: boolean,
  generatedAt: string,
  durationMs: number,
  optionalFailures: IntegrationSummaryEntry[],
  requireOptional: boolean
): void {
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
  console.log(`Report generated at ${generatedAt} (took ${durationMs}ms).`);

  if (summary.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of summary.warnings) {
      console.log(`  • ${warning}`);
    }
  }

  if (failOnWarnings && summary.warnings.length > 0) {
    console.log('\nValidation warnings are treated as errors (--fail-on-warnings).');
  }

  if (summary.integrations.length > 0) {
    console.log('\nIntegration readiness:');
    for (const integration of summary.integrations) {
      const optionalLabel = integration.optional ? ' (optional)' : '';
      const statusLabel =
        integration.status === 'placeholder'
          ? 'Placeholder only'
          : integration.status.charAt(0).toUpperCase() + integration.status.slice(1);
      const notes: string[] = [];
      if (integration.missing.length > 0) {
        notes.push(`missing ${integration.missing.join(', ')}`);
      }
      if (integration.placeholders.length > 0) {
        notes.push(`placeholder values for ${integration.placeholders.join(', ')}`);
      }
      const noteText = notes.length > 0 ? ` — ${notes.join('; ')}` : '';
      console.log(`  • ${integration.label}${optionalLabel}: ${statusLabel}${noteText}`);
    }

    const stats = summary.integrationStats;
    console.log(
      `\nSummary: ${stats.ready}/${stats.total} ready (${formatPercentage(stats.readyPercentage)}), ${stats.partial} partial, ${stats.missing} missing, ${stats.placeholder} placeholder-only`
    );
    console.log(
      `Required integrations ready: ${stats.requiredReady}/${stats.requiredTotal} (${formatPercentage(stats.requiredReadyPercentage)}). Optional integrations ready: ${stats.optionalReady}/${stats.optionalTotal} (${formatPercentage(stats.optionalReadyPercentage)}).`
    );
  }

  if (requireOptional) {
    if (optionalFailures.length === 0) {
      console.log('\nOptional integrations were required for this run and all of them are ready.');
    } else {
      console.log('\nOptional integrations required for this run are not ready:');
      for (const integration of optionalFailures) {
        const notes: string[] = [];
        if (integration.missing.length > 0) {
          notes.push(`missing ${integration.missing.join(', ')}`);
        }
        if (integration.placeholders.length > 0) {
          notes.push(`placeholder values for ${integration.placeholders.join(', ')}`);
        }
        const detail = notes.length > 0 ? ` — ${notes.join('; ')}` : '';
        console.log(`  • ${integration.label} (${integration.status})${detail}`);
      }
    }
  }

  const optionalFailureTriggered = requireOptional && optionalFailures.length > 0;

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
  } else if (optionalFailureTriggered) {
    console.log('\nEnvironment validation failed because optional integrations were required but not ready.');
    process.exitCode = 1;
  } else if (failOnWarnings && summary.warnings.length > 0) {
    console.log('\nEnvironment validation failed due to warnings.');
    process.exitCode = 1;
  } else {
    console.log('\nAll required environment variables are set.');
  }
}

function main(): void {
  try {
    const startTime = performance.now();
    const args = parseArgs(process.argv);
    const { env, loadedFiles } = prepareEnvironment(args);
    const summary = getEnvironmentValidationSummary(env);
    const generatedAt = new Date().toISOString();
    const durationMs = Math.round(performance.now() - startTime);
    const optionalFailures = args.requireOptional
      ? summary.integrations.filter((integration) => integration.optional && integration.status !== 'ready')
      : [];

    if (args.json) {
      outputJson(
        summary,
        loadedFiles,
        args.failOnWarnings,
        generatedAt,
        durationMs,
        optionalFailures,
        args.requireOptional
      );
    } else {
      outputHuman(
        summary,
        loadedFiles,
        args.failOnWarnings,
        generatedAt,
        durationMs,
        optionalFailures,
        args.requireOptional
      );
    }

    if (args.outputPath) {
      writeSummaryToFile(
        args.outputPath,
        summary,
        loadedFiles,
        args.failOnWarnings,
        generatedAt,
        durationMs,
        optionalFailures,
        args.requireOptional
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

main();
