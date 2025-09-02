import { getEnvironmentConfig, getLogLevel, shouldEnableDebugMode } from './env-validation';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private logLevel: LogLevel;
  private logFormat: 'json' | 'text';

  constructor() {
    this.logLevel = (getLogLevel() as LogLevel) || 'info';
    const config = getEnvironmentConfig();
    this.logFormat = (config?.monitoring.logFormat as 'json' | 'text') || 'json';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: shouldEnableDebugMode() ? error.stack : undefined,
      };
    }

    return entry;
  }

  private writeLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.logFormat === 'json') {
      console.log(JSON.stringify(entry));
    } else {
      const contextStr = entry.context ? `[${entry.context}] ` : '';
      const metadataStr = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      const errorStr = entry.error ? ` Error: ${entry.error.message}` : '';
      console.log(`${entry.timestamp} ${entry.level.toUpperCase()} ${contextStr}${entry.message}${metadataStr}${errorStr}`);
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.writeLog(this.createLogEntry('debug', message, context, metadata));
    }
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.writeLog(this.createLogEntry('info', message, context, metadata));
    }
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.writeLog(this.createLogEntry('warn', message, context, metadata));
    }
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.writeLog(this.createLogEntry('error', message, context, metadata, error));
    }
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = level 
      ? this.logs.filter(log => log.level === level)
      : this.logs;

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    oldestTimestamp?: string;
    newestTimestamp?: string;
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };

    this.logs.forEach(log => {
      byLevel[log.level]++;
    });

    return {
      total: this.logs.length,
      byLevel,
      oldestTimestamp: this.logs[0]?.timestamp,
      newestTimestamp: this.logs[this.logs.length - 1]?.timestamp,
    };
  }
}

export const logger = new Logger();

export function createContextLogger(context: string) {
  return {
    debug: (message: string, metadata?: Record<string, any>) => 
      logger.debug(message, context, metadata),
    info: (message: string, metadata?: Record<string, any>) => 
      logger.info(message, context, metadata),
    warn: (message: string, metadata?: Record<string, any>) => 
      logger.warn(message, context, metadata),
    error: (message: string, error?: Error, metadata?: Record<string, any>) => 
      logger.error(message, error, context, metadata),
  };
}
