import { getEnvironmentConfig, getEnvironmentValidationSummary, type EnvironmentConfig } from './env-validation';

export type { EnvironmentConfig };

export function validateEnvironment(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
  mode: string;
  reason?: string;
} {
  const summary = getEnvironmentValidationSummary();
  return {
    valid: summary.valid,
    missing: summary.missing,
    warnings: summary.warnings,
    mode: summary.mode.type,
    reason: summary.mode.type === 'relaxed' ? summary.mode.reason : undefined,
  };
}

export function getConfig(): EnvironmentConfig {
  return getEnvironmentConfig();
}
