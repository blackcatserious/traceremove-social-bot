import 'dotenv/config';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { getEnvironmentValidationSummary } from '../src/lib/env-validation.ts';

type CliOptions = {
  json: boolean;
  outputPath?: string;
};

type ValidationSummary = ReturnType<typeof getEnvironmentValidationSummary>;

type ParsedArgs = CliOptions & { showHelp: boolean };

function parseArgs(argv: string[]): ParsedArgs {
  const options: ParsedArgs = {
    json: false,
    showHelp: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.showHelp = true;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--output' || arg === '-o') {
      const next = argv[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('Missing value for --output option');
      }
      options.outputPath = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
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

function resolveOutputPath(rawPath: string): string {
  if (!rawPath) {
    throw new Error('Output path cannot be empty');
  }

  const envExpanded = expandEnvironmentVariables(rawPath);
  const tildeExpanded = envExpanded.replace(/^~(?=$|[\\/])/, os.homedir());

  return path.resolve(tildeExpanded);
}

function ensureDirectoryExists(filePath: string): void {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
}

function printHelp(): void {
  console.log(`Usage: npm run check:env [-- --json] [-- --output <path>]

Options:
  --json             Print the validation summary as JSON
  -o, --output PATH  Write the JSON summary to the provided path
  -h, --help         Show this help message
`);
}

function writeSummaryToFile(summary: ValidationSummary, rawPath: string): string {
  const resolvedPath = resolveOutputPath(rawPath);
  ensureDirectoryExists(resolvedPath);
  const payload = JSON.stringify(summary, null, 2);
  fs.writeFileSync(resolvedPath, `${payload}\n`, 'utf8');
  return resolvedPath;
}

function formatSummary(summary: ValidationSummary): string {
  if (summary.valid) {
    if (summary.warnings.length === 0) {
      return 'Environment validation passed with no warnings.';
    }
    return `Environment validation passed with warnings:\n- ${summary.warnings.join('\n- ')}`;
  }

  const missingList = summary.missing.map((item) => `- ${item}`).join('\n');
  const warningList = summary.warnings.length > 0 ? `\nWarnings:\n- ${summary.warnings.join('\n- ')}` : '';
  return `Environment validation failed. Missing variables:\n${missingList}${warningList}`;
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.showHelp) {
      printHelp();
      return;
    }

    const summary = getEnvironmentValidationSummary();

    if (args.outputPath) {
      const savedPath = writeSummaryToFile(summary, args.outputPath);
      console.log(`Validation summary written to ${savedPath}`);
    }

    if (args.json) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    console.log(formatSummary(summary));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

void main();
