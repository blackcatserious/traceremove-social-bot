import nextEnv from '@next/env';
import path from 'node:path';

import { getEnvironmentValidationSummary } from '../src/lib/env-validation';

const { loadEnvConfig } = nextEnv;

type CliArgs = {
  json: boolean;
};

function parseArgs(argv: string[]): CliArgs {
  const args = new Set(argv.slice(2));
  return {
    json: args.has('--json'),
  };
}

function loadEnvironmentFromFiles(): string[] {
  const projectDir = process.cwd();
  const dev = process.env.NODE_ENV !== 'production';
  const { loadedEnvFiles } = loadEnvConfig(projectDir, dev);
  return loadedEnvFiles.map((file) => path.relative(projectDir, file.path));
}

function outputJson(summary: ReturnType<typeof getEnvironmentValidationSummary>, loadedFiles: string[]): void {
  const payload = {
    valid: summary.valid,
    mode: summary.mode,
    warnings: summary.warnings,
    missing: summary.missing,
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
  const args = parseArgs(process.argv);
  const loadedFiles = loadEnvironmentFromFiles();
  const summary = getEnvironmentValidationSummary();

  if (args.json) {
    outputJson(summary, loadedFiles);
  } else {
    outputHuman(summary, loadedFiles);
  }
}

main();
