import {
  getEnvironmentConfig,
  getEnvironmentValidationSummary,
  type EnvironmentConfig,
  type IntegrationSummaryEntry,
  type IntegrationReadinessStats,
} from './env-validation';

export type { EnvironmentConfig };

export function validateEnvironment(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
  mode: string;
  reason?: string;
  integrations: IntegrationSummaryEntry[];
  integrationStats: IntegrationReadinessStats;
} {
  const summary = getEnvironmentValidationSummary();
  return {
    valid: summary.valid,
    missing: summary.missing,
    warnings: summary.warnings,
    mode: summary.mode.type,
    reason: summary.mode.type === 'relaxed' ? summary.mode.reason : undefined,
    integrations: summary.integrations,
    integrationStats: summary.integrationStats,
  };
}

export function getConfig(): EnvironmentConfig {
  return getEnvironmentConfig();
}
