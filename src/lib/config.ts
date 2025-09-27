import {
  getEnvironmentConfig,
  getEnvironmentValidationSummary,
  type EnvironmentConfig,
  type IntegrationSummaryEntry,
} from './env-validation';

export type { EnvironmentConfig };

export function validateEnvironment(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
  mode: string;
  reason?: string;
  integrations: IntegrationSummaryEntry[];
} {
  const summary = getEnvironmentValidationSummary();
  return {
    valid: summary.valid,
    missing: summary.missing,
    warnings: summary.warnings,
    mode: summary.mode.type,
    reason: summary.mode.type === 'relaxed' ? summary.mode.reason : undefined,
    integrations: summary.integrations,
  };
}

export function getConfig(): EnvironmentConfig {
  return getEnvironmentConfig();
}
