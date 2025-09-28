import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import process from 'node:process';
import { performance } from 'node:perf_hooks';

import { parse as parseEnv } from 'dotenv';

import { getEnvironmentValidationSummary } from '../src/lib/env-validation.ts';

type ValidationSummary = ReturnType<typeof getEnvironmentValidationSummary>;

type CliOptions = {
  json: boolean;
  outputPath?: string;
  silent: boolean;
  dotenvPaths: string[];
  example: boolean;
  requireIntegrations: string[];
  requireOptional: boolean;
  failOnWarnings: boolean;
  modeOverride?: 'strict' | 'relaxed';
};

type ParsedArgs = CliOptions & { showHelp: boolean };

type IntegrationSummaryEntry = ValidationSummary['integrations'][number];

type EnforcedIntegration = IntegrationSummaryEntry & { enforcedAs: 'explicit' | 'optional'; };

type CliResult = {
  summary: ValidationSummary;
  generatedAt: string;
  durationMs: number;
  loadedEnvFiles: string[];
  enforcedIntegrations: EnforcedIntegration[];
  exampleFile?: string;
  failureReasons: string[];
  failedDueToWarnings: boolean;
  success: boolean;
};

function parseArgs(argv: string[]): ParsedArgs {
  const options: ParsedArgs = {
    json: false,
    silent: false,
    dotenvPaths: [],
    example: false,
    requireIntegrations: [],
    requireOptional: false,
    failOnWarnings: false,
    showHelp: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--help':
      case '-h':
        options.showHelp = true;
        continue;
      case '--json':
        options.json = true;
        continue;
      case '--output':
      case '-o': {
        const next = argv[index + 1];
        if (!next || next.startsWith('-')) {
          throw new Error('Missing value for --output option');
        }
        options.outputPath = next;
        index += 1;
        continue;
      }
      case '--silent':
        options.silent = true;
        continue;
      case '--dotenv': {
        const next = argv[index + 1];
        if (!next || next.startsWith('-')) {
          throw new Error('Missing value for --dotenv option');
        }
        options.dotenvPaths.push(next);
        index += 1;
        continue;
      }
      case '--example':
        options.example = true;
        continue;
      case '--require': {
        const next = argv[index + 1];
        if (!next || next.startsWith('-')) {
          throw new Error('Missing value for --require option');
        }
        options.requireIntegrations.push(next.toLowerCase());
        index += 1;
        continue;
      }
      case '--require-optional':
        options.requireOptional = true;
        continue;
      case '--fail-on-warnings':
        options.failOnWarnings = true;
        continue;
      case '--strict':
        if (options.modeOverride === 'relaxed') {
          throw new Error('Cannot specify both --strict and --relaxed');
        }
        options.modeOverride = 'strict';
        continue;
      case '--relaxed':
        if (options.modeOverride === 'strict') {
          throw new Error('Cannot specify both --strict and --relaxed');
        }
        options.modeOverride = 'relaxed';
        continue;
      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown argument: ${arg}`);
        }
        throw new Error(`Unexpected positional argument: ${arg}`);
    }
  }

  return options;
}

function expandEnvironmentVariables(rawPath: string): string {
  const unixPattern = /\$(?:{([^}]+)}|([A-Za-z_][A-Za-z0-9_]*))/g;
  const windowsPattern = /%([^%]+)%/g;

  const expandUnix = rawPath.replace(unixPattern, (match, group1, group2) => {
    const key = (group1 || group2) as string;
    const value = process.env[key];
    return value !== undefined ? value : match;
  });

  return expandUnix.replace(windowsPattern, (match, key) => {
    const value = process.env[key as string];
    return value !== undefined ? value : match;
  });
}

function resolvePath(rawPath: string): string {
  if (!rawPath) {
    throw new Error('Path cannot be empty');
  }

  const envExpanded = expandEnvironmentVariables(rawPath);
  const tildeExpanded = envExpanded.replace(/^~(?=$|[\\/])/, os.homedir());

  return path.resolve(tildeExpanded);
}

function ensureDirectoryExists(filePath: string): void {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
}

function loadEnvFile(
  filePath: string,
  envTarget: NodeJS.ProcessEnv,
  loadedFiles: string[],
  { allowMissing }: { allowMissing: boolean }
): void {
  if (!fs.existsSync(filePath)) {
    if (allowMissing) {
      return;
    }
    throw new Error(`Environment file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = parseEnv(content);
  for (const [key, value] of Object.entries(parsed)) {
    envTarget[key] = value;
  }
  loadedFiles.push(filePath);
}

function buildEvaluationEnvironment(options: CliOptions): {
  env: NodeJS.ProcessEnv;
  loadedEnvFiles: string[];
  exampleFile?: string;
} {
  const evaluationEnv = Object.assign(
    {},
    options.example ? {} : process.env
  ) as NodeJS.ProcessEnv;
  const loadedEnvFiles: string[] = [];
  const cwd = process.cwd();
  let exampleFile: string | undefined;

  if (options.example) {
    exampleFile = path.resolve(cwd, '.env.example');
    loadEnvFile(exampleFile, evaluationEnv, loadedEnvFiles, { allowMissing: false });
    if (!options.modeOverride) {
      evaluationEnv.SKIP_ENV_VALIDATION = evaluationEnv.SKIP_ENV_VALIDATION ?? 'true';
      delete evaluationEnv.ENFORCE_ENV_VALIDATION;
    }
  } else {
    const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();
    const defaultFiles = [
      `.env.${nodeEnv}.local`,
      '.env.local',
      `.env.${nodeEnv}`,
      '.env',
    ];

    for (const relative of defaultFiles) {
      const resolved = path.resolve(cwd, relative);
      loadEnvFile(resolved, evaluationEnv, loadedEnvFiles, { allowMissing: true });
    }
  }

  for (const dotenvPath of options.dotenvPaths) {
    const resolved = resolvePath(dotenvPath);
    loadEnvFile(resolved, evaluationEnv, loadedEnvFiles, { allowMissing: false });
  }

  if (options.modeOverride === 'strict') {
    evaluationEnv.ENFORCE_ENV_VALIDATION = 'true';
    delete evaluationEnv.SKIP_ENV_VALIDATION;
  } else if (options.modeOverride === 'relaxed') {
    evaluationEnv.SKIP_ENV_VALIDATION = 'true';
    delete evaluationEnv.ENFORCE_ENV_VALIDATION;
  }

  if (process.env.npm_lifecycle_event) {
    evaluationEnv.npm_lifecycle_event = process.env.npm_lifecycle_event;
  }

  return { env: evaluationEnv, loadedEnvFiles, exampleFile };
}

function printHelp(): void {
  console.log(`Usage: npm run check:env [-- <options>]

Options:
  --json                 Print the validation summary as JSON
  -o, --output <path>    Write the JSON summary to the provided path
  --silent               Suppress human-readable output (still writes JSON when requested)
  --dotenv <path>        Load an additional .env file (repeatable)
  --example              Validate the .env.example file instead of the active environment
  --require <name>       Require the specified integration to be ready (repeatable)
  --require-optional     Treat optional integrations as required for this run
  --fail-on-warnings     Exit with a failure code if warnings are emitted
  --strict               Force strict validation mode for this run
  --relaxed              Force relaxed validation mode for this run
  -h, --help             Show this help message
`);
}

function writeSummaryToFile(payload: CliResult, rawPath: string, silent: boolean): string {
  const resolvedPath = resolvePath(rawPath);
  ensureDirectoryExists(resolvedPath);
  const data = JSON.stringify(payload, null, 2);
  fs.writeFileSync(resolvedPath, `${data}\n`, 'utf8');
  if (!silent) {
    console.log(`Validation summary written to ${resolvedPath}`);
  }
  return resolvedPath;
}

function describeIntegrationFailure(entry: IntegrationSummaryEntry): string {
  const parts: string[] = [];

  switch (entry.status) {
    case 'missing':
      parts.push('missing');
      break;
    case 'partial':
      parts.push('partial');
      break;
    case 'placeholder':
      parts.push('contains only placeholders');
      break;
    default:
      parts.push(entry.status);
      break;
  }

  if (entry.missing.length > 0) {
    parts.push(`missing keys: ${entry.missing.join(', ')}`);
  }

  if (entry.placeholders.length > 0) {
    parts.push(`placeholder keys: ${entry.placeholders.join(', ')}`);
  }

  return `${entry.label} (${entry.key}) is ${parts.join('; ')}`;
}

function evaluateEnforcements(
  summary: ValidationSummary,
  options: CliOptions
): { enforced: EnforcedIntegration[]; failures: string[] } {
  const integrationMap = new Map<string, IntegrationSummaryEntry>();
  for (const entry of summary.integrations) {
    integrationMap.set(entry.key.toLowerCase(), entry);
  }

  const enforced: EnforcedIntegration[] = [];
  const seen = new Set<string>();

  for (const requestedKey of options.requireIntegrations) {
    const integration = integrationMap.get(requestedKey.toLowerCase());
    if (!integration) {
      const available = summary.integrations.map((entry) => entry.key).join(', ');
      throw new Error(`Unknown integration "${requestedKey}". Available integrations: ${available}`);
    }
    if (!seen.has(integration.key)) {
      enforced.push({ ...integration, enforcedAs: 'explicit' });
      seen.add(integration.key);
    }
  }

  if (options.requireOptional) {
    for (const entry of summary.integrations) {
      if (entry.optional && !seen.has(entry.key)) {
        enforced.push({ ...entry, enforcedAs: 'optional' });
        seen.add(entry.key);
      }
    }
  }

  const failures = enforced
    .filter((entry) => entry.status !== 'ready')
    .map((entry) => describeIntegrationFailure(entry));

  return { enforced, failures };
}

function createCliResult(
  summary: ValidationSummary,
  metadata: {
    generatedAt: string;
    durationMs: number;
    loadedEnvFiles: string[];
    exampleFile?: string;
  },
  options: CliOptions
): CliResult {
  const { enforced, failures } = evaluateEnforcements(summary, options);
  const failedDueToWarnings = options.failOnWarnings && summary.warnings.length > 0;
  const failureReasons: string[] = [];

  if (!summary.valid) {
    failureReasons.push(
      summary.missing.length > 0
        ? `Missing required environment variables: ${summary.missing.join(', ')}`
        : 'Environment validation did not pass.'
    );
  }

  failureReasons.push(...failures);

  if (failedDueToWarnings) {
    failureReasons.push('Warnings were treated as failures.');
  }

  const success = summary.valid && failures.length === 0 && !failedDueToWarnings;

  return {
    summary,
    generatedAt: metadata.generatedAt,
    durationMs: metadata.durationMs,
    loadedEnvFiles: metadata.loadedEnvFiles,
    exampleFile: metadata.exampleFile,
    enforcedIntegrations: enforced,
    failureReasons,
    failedDueToWarnings,
    success,
  };
}

function formatHumanResult(result: CliResult): string {
  const { summary } = result;
  const lines: string[] = [];
  const modeDescription =
    summary.mode.type === 'strict'
      ? 'Strict validation'
      : `Relaxed validation (${summary.mode.reason ?? 'no reason provided'})`;

  lines.push(`Environment validation mode: ${modeDescription}`);
  lines.push(`Validation duration: ${result.durationMs.toFixed(1)}ms`);
  lines.push(`Generated at: ${result.generatedAt}`);

  if (result.loadedEnvFiles.length > 0) {
    lines.push('Loaded environment files:');
    for (const file of result.loadedEnvFiles) {
      lines.push(`  - ${file}`);
    }
  } else {
    lines.push('Loaded environment files: (none)');
  }

  if (result.exampleFile) {
    lines.push(`Validated example file: ${result.exampleFile}`);
  }

  const stats = summary.integrationStats;
  lines.push('Integration readiness:');
  lines.push(
    `  - Overall ready: ${stats.ready}/${stats.total} (${stats.readyPercentage.toFixed(1)}%)`
  );
  lines.push(
    `  - Required ready: ${stats.requiredReady}/${stats.requiredTotal} (${stats.requiredReadyPercentage.toFixed(1)}%)`
  );
  lines.push(
    `  - Optional ready: ${stats.optionalReady}/${stats.optionalTotal} (${stats.optionalReadyPercentage.toFixed(1)}%)`
  );

  if (summary.missing.length > 0) {
    lines.push('Missing variables:');
    for (const key of summary.missing) {
      lines.push(`  - ${key}`);
    }
  } else {
    lines.push('Missing variables: (none)');
  }

  if (summary.warnings.length > 0) {
    lines.push('Warnings:');
    for (const warning of summary.warnings) {
      lines.push(`  - ${warning}`);
    }
  } else {
    lines.push('Warnings: (none)');
  }

  if (summary.placeholders.length > 0) {
    lines.push('Placeholder values were used for:');
    for (const key of summary.placeholders) {
      lines.push(`  - ${key}`);
    }
  }

  if (result.enforcedIntegrations.length > 0) {
    lines.push('Enforced integrations:');
    for (const entry of result.enforcedIntegrations) {
      const prefix = entry.enforcedAs === 'optional' ? '(optional)' : '(explicit)';
      lines.push(`  - ${prefix} ${entry.label} (${entry.key}) – ${entry.status}`);
      if (entry.missing.length > 0) {
        lines.push(`      Missing: ${entry.missing.join(', ')}`);
      }
      if (entry.placeholders.length > 0) {
        lines.push(`      Placeholders: ${entry.placeholders.join(', ')}`);
      }
    }
  }

  if (result.failureReasons.length > 0) {
    lines.push('Result: FAIL');
    for (const reason of result.failureReasons) {
      lines.push(`  - ${reason}`);
    }
  } else {
    lines.push('Result: PASS');
  }

  return lines.join('\n');
}

async function main(): Promise<void> {
  const start = performance.now();
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.showHelp) {
      printHelp();
      return;
    }

    const { env, loadedEnvFiles, exampleFile } = buildEvaluationEnvironment(args);

    const summary = getEnvironmentValidationSummary(env);
    const generatedAt = new Date().toISOString();
    const durationMs = performance.now() - start;

    const result = createCliResult(
      summary,
      { generatedAt, durationMs, loadedEnvFiles, exampleFile },
      args
    );

    if (args.outputPath) {
      writeSummaryToFile(result, args.outputPath, args.json || args.silent);
    }

    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else if (!args.silent) {
      console.log(formatHumanResult(result));
    }

    if (!result.success) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

void main();
