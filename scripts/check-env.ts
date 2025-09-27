import { getEnvironmentValidationSummary } from '../src/lib/env-validation';

function printSummary(): void {
  const summary = getEnvironmentValidationSummary();
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

printSummary();
