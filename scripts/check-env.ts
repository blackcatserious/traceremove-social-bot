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

type RequirementReason = 'optional' | 'explicit';

type IntegrationRequirement = {
  integration: IntegrationSummaryEntry;
  reasons: RequirementReason[];
};

type CliArgs = {
  json: boolean;
  dotenvFiles: string[];
  exampleFile?: string;
  modeOverride?: ValidationOverride;
  failOnWarnings: boolean;
  outputPath?: string;
  requireOptional: boolean;
  requiredIntegrations: string[];
  silent: boolean;
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

function sortRequirementReasons(reasons: Iterable<RequirementReason>): RequirementReason[] {
  const order: Record<RequirementReason, number> = {
    optional: 0,
    explicit: 1,
  };
  return Array.from(new Set(reasons)).sort((a, b) => order[a] - order[b]);
}

function describeRequirementReasons(reasons: RequirementReason[]): string | undefined {
  if (reasons.length === 0) {
    return undefined;
  }
  const descriptions = reasons.map((reason) => {
    if (reason === 'optional') {
      return 'optional enforcement (--require-optional)';
    }
    return 'explicit request (--require)';
  });
  if (descriptions.length === 1) {
    return descriptions[0];
  }
  return `${descriptions.slice(0, -1).join(', ')} and ${descriptions.at(-1)}`;
}

function summarizeRequirementSources(
  requireOptional: boolean,
  requiredIntegrations: IntegrationRequirement[]
): string {
  const hasExplicit = requiredIntegrations.some((entry) => entry.reasons.includes('explicit'));
  const sources: string[] = [];
  if (requireOptional) {
    sources.push('optional enforcement');
  }
  if (hasExplicit) {
    sources.push('explicit requests');
  }
  if (sources.length === 0) {
    return '';
  }
  if (sources.length === 1) {
    return ` (${sources[0]})`;
  }
  return ` (${sources.join(' + ')})`;
}

function buildIntegrationRequirements(
  integrations: IntegrationSummaryEntry[],
  requireOptional: boolean,
  requiredIntegrations: string[]
): IntegrationRequirement[] {
  const byKey = new Map(
    integrations.map((integration) => [integration.key.toLowerCase(), integration] as const)
  );

  const requirements = new Map<string, { integration: IntegrationSummaryEntry; reasons: Set<RequirementReason> }>();

  if (requireOptional) {
    for (const integration of integrations) {
      if (!integration.optional) {
        continue;
      }
      requirements.set(integration.key.toLowerCase(), {
        integration,
        reasons: new Set<RequirementReason>(['optional']),
      });
    }
  }

  for (const key of requiredIntegrations) {
    const integration = byKey.get(key.toLowerCase());
    if (!integration) {
      continue;
    }
    const normalizedKey = integration.key.toLowerCase();
    const existing = requirements.get(normalizedKey);
    if (existing) {
      existing.reasons.add('explicit');
      continue;
    }
    requirements.set(normalizedKey, {
      integration,
      reasons: new Set<RequirementReason>(['explicit']),
    });
  }

  return Array.from(requirements.values()).map(({ integration, reasons }) => ({
    integration,
    reasons: sortRequirementReasons(reasons),
  }));
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    json: false,
    dotenvFiles: [],
    failOnWarnings: false,
    requireOptional: false,
    requiredIntegrations: [],
    silent: false,
  };

  function addRequiredIntegrations(value: string | undefined, flag: string): void {
    if (!value) {
      throw new Error(`Missing value for ${flag}`);
    }
    const integrations = value
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 0);
    if (integrations.length === 0) {
      throw new Error(`Missing value for ${flag}`);
    }
    for (const integration of integrations) {
      if (!args.requiredIntegrations.includes(integration)) {
        args.requiredIntegrations.push(integration);
      }
    }
  }
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

    if (token === '--silent') {
      args.silent = true;
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

    if (
      token === '--require' ||
      token === '--require-integration' ||
      token === '--require-integrations'
    ) {
      const nextToken = argv[index + 1];
      if (!nextToken || nextToken.startsWith('-')) {
        throw new Error('Missing value for --require');
      }
      addRequiredIntegrations(nextToken, '--require');
      index += 1;
      continue;
    }

    if (token.startsWith('--require=')) {
      const [, value] = token.split('=');
      addRequiredIntegrations(value, '--require');
      continue;
    }

    if (token.startsWith('--require-integration=')) {
      const [, value] = token.split('=');
      addRequiredIntegrations(value, '--require-integration');
      continue;
    }

    if (token.startsWith('--require-integrations=')) {
      const [, value] = token.split('=');
      addRequiredIntegrations(value, '--require-integrations');
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

  if (args.silent && args.json) {
    throw new Error('Cannot combine --silent with --json. Use --output to save the JSON summary without printing it.');
  }

  return args;
}

function printHelp(): void {
  const message = [
    'Usage: npm run check:env [-- --json] [-- --dotenv <path> ...] [-- --example [path]] [-- --strict|--relaxed]',
    '',
    'Options:',
    '  --json              Output results as JSON',
    '  --dotenv <path>     Load one or more additional env files on top of the standard Next.js resolution',
    '  --example [path]    Validate an example env file (defaults to .env.example) without touching local secrets',
    '  --strict            Force strict validation (sets ENFORCE_ENV_VALIDATION=true for the run)',
    '  --relaxed           Force relaxed validation (sets SKIP_ENV_VALIDATION=true for the run)',
    '  --fail-on-warnings  Exit with a non-zero status code if validation warnings are present',
    '  --require-optional  Treat optional integrations as required and fail if any are not ready',
    '  --require <keys>    Require specific integrations by key (comma separated or repeat the flag)',
    '  --output <path>     Write the JSON summary payload to a file (useful for CI artifacts)',
    '  --silent            Suppress human-readable output (pair with --output for quiet CI runs)',
    '  -h, --help          Show this help message',
  ].join('\n');
  console.log(message);
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
  requiredIntegrations: IntegrationRequirement[],
  requireOptional: boolean
) {
  const requirementFailures = requiredIntegrations.filter(
    (item) => item.integration.status !== 'ready'
  );
  const optionalFailures = requireOptional
    ? requirementFailures.filter((item) => item.reasons.includes('optional'))
    : [];

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
      ? optionalFailures.map((entry) => ({
          key: entry.integration.key,
          label: entry.integration.label,
          status: entry.integration.status,
          missing: entry.integration.missing,
          placeholders: entry.integration.placeholders,
          reasons: entry.reasons,
        }))
      : [],
    requiredIntegrations: requiredIntegrations.map((entry) => ({
      key: entry.integration.key,
      label: entry.integration.label,
      status: entry.integration.status,
      optional: entry.integration.optional,
      missing: entry.integration.missing,
      placeholders: entry.integration.placeholders,
      reasons: entry.reasons,
    })),
    failedDueToIntegrationRequirements: requirementFailures.length > 0,
    missingRequiredIntegrations: requirementFailures.map((entry) => ({
      key: entry.integration.key,
      label: entry.integration.label,
      status: entry.integration.status,
      optional: entry.integration.optional,
      missing: entry.integration.missing,
      placeholders: entry.integration.placeholders,
      reasons: entry.reasons,
    })),
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
  requiredIntegrations: IntegrationRequirement[],
  requireOptional: boolean
): void {
  const payload = createSummaryPayload(
    summary,
    loadedFiles,
    failOnWarnings,
    generatedAt,
    durationMs,
    requiredIntegrations,
    requireOptional
  );
  console.log(JSON.stringify(payload, null, 2));
  if (
    !summary.valid ||
    (failOnWarnings && summary.warnings.length > 0) ||
    payload.failedDueToIntegrationRequirements
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
  requiredIntegrations: IntegrationRequirement[],
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
    requiredIntegrations,
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
  requiredIntegrations: IntegrationRequirement[],
  requireOptional: boolean,
  silent: boolean
): void {
  const log = silent ? (..._args: unknown[]) => {} : console.log.bind(console);

  if (loadedFiles.length > 0) {
    log('Loaded environment files:');
    for (const file of loadedFiles) {
      log(`  • ${file}`);
    }
    log('');
  }

  const modeLabel = summary.mode.type === 'relaxed'
    ? `relaxed (${summary.mode.reason ?? 'no reason provided'})`
    : 'strict';

  log('Environment validation mode:', modeLabel);
  log(`Report generated at ${generatedAt} (took ${durationMs}ms).`);

  if (summary.warnings.length > 0) {
    log('\nWarnings:');
    for (const warning of summary.warnings) {
      log(`  • ${warning}`);
    }
  }

  if (failOnWarnings && summary.warnings.length > 0) {
    log('\nValidation warnings are treated as errors (--fail-on-warnings).');
  }

  if (summary.integrations.length > 0) {
    log('\nIntegration readiness:');
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
      log(`  • ${integration.label}${optionalLabel}: ${statusLabel}${noteText}`);
    }

    const stats = summary.integrationStats;
    log(
      `\nSummary: ${stats.ready}/${stats.total} ready (${formatPercentage(stats.readyPercentage)}), ${stats.partial} partial, ${stats.missing} missing, ${stats.placeholder} placeholder-only`
    );
    log(
      `Required integrations ready: ${stats.requiredReady}/${stats.requiredTotal} (${formatPercentage(stats.requiredReadyPercentage)}). Optional integrations ready: ${stats.optionalReady}/${stats.optionalTotal} (${formatPercentage(stats.optionalReadyPercentage)}).`
    );
  }

  if (requiredIntegrations.length > 0) {
    const requirementFailures = requiredIntegrations.filter(
      (entry) => entry.integration.status !== 'ready'
    );
    const sourceSummary = summarizeRequirementSources(requireOptional, requiredIntegrations);

    if (requirementFailures.length === 0) {
      log(`\nIntegrations required for this run${sourceSummary} are ready.`);
    } else {
      log(`\nIntegrations required for this run${sourceSummary} are not ready:`);
      for (const entry of requirementFailures) {
        const notes: string[] = [];
        if (entry.integration.missing.length > 0) {
          notes.push(`missing ${entry.integration.missing.join(', ')}`);
        }
        if (entry.integration.placeholders.length > 0) {
          notes.push(`placeholder values for ${entry.integration.placeholders.join(', ')}`);
        }
        const reasonText = describeRequirementReasons(entry.reasons);
        if (reasonText) {
          notes.push(reasonText);
        }
        const detail = notes.length > 0 ? ` — ${notes.join('; ')}` : '';
        log(`  • ${entry.integration.label} (${entry.integration.status})${detail}`);
      }
    }
  }

  const requirementFailureTriggered = requiredIntegrations.some(
    (entry) => entry.integration.status !== 'ready'
  );

  if (summary.placeholders.length > 0) {
    log('\nPlaceholder values injected for:');
    for (const key of summary.placeholders) {
      log(`  • ${key}`);
    }
  }

  if (summary.missing.length > 0) {
    log('\nMissing variables:');
    for (const variable of summary.missing) {
      log(`  • ${variable}`);
    }
    log('\nEnvironment validation failed.');
    process.exitCode = 1;
  } else if (requirementFailureTriggered) {
    log('\nEnvironment validation failed because required integrations were not ready.');
    process.exitCode = 1;
  } else if (failOnWarnings && summary.warnings.length > 0) {
    log('\nEnvironment validation failed due to warnings.');
    process.exitCode = 1;
  } else {
    log('\nAll required environment variables are set.');
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
    const integrationLookup = new Map(
      summary.integrations.map((integration) => [integration.key.toLowerCase(), integration] as const)
    );
    const unknownKeys = args.requiredIntegrations.filter(
      (key) => !integrationLookup.has(key.toLowerCase())
    );
    if (unknownKeys.length > 0) {
      const available = summary.integrations.map((integration) => integration.key).sort();
      throw new Error(
        `Unknown integration key(s) specified via --require: ${unknownKeys.join(', ')}. Available keys: ${available.join(', ')}`
      );
    }

    const requiredIntegrations = buildIntegrationRequirements(
      summary.integrations,
      args.requireOptional,
      args.requiredIntegrations
    );

    if (args.json) {
      outputJson(
        summary,
        loadedFiles,
        args.failOnWarnings,
        generatedAt,
        durationMs,
        requiredIntegrations,
        args.requireOptional
      );
    } else {
      outputHuman(
        summary,
        loadedFiles,
        args.failOnWarnings,
        generatedAt,
        durationMs,
        requiredIntegrations,
        args.requireOptional,
        args.silent
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
        requiredIntegrations,
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
