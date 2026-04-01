/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Structured logger optimized for serverless environments.
 * Outputs JSON for easy parsing by log aggregation services.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  deviceId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  duration?: number;
}

class Logger {
  private service = 'miaomiao-api';
  private version = process.env.API_VERSION || '1.0.0';
  private environment = process.env.NODE_ENV || 'development';
  private minLevel: LogLevel = this.getMinLevel();

  private getMinLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL as LogLevel;
    if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
      return envLevel;
    }
    return this.environment === 'production' ? 'info' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error, duration?: number) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      version: this.version,
      environment: this.environment,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        code: (error as { code?: string }).code,
      };
      // Only include stack trace in non-production environments
      if (this.environment !== 'production') {
        entry.error.stack = error.stack;
      }
    }

    if (duration !== undefined) {
      entry.duration = duration;
    }

    // Output as JSON for serverless log aggregation
    console.log(JSON.stringify(entry));
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext, error?: Error) {
    this.log('warn', message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log('error', message, context, error);
  }

  // Log API request/response
  request(method: string, path: string, context?: LogContext) {
    this.info(`→ ${method} ${path}`, context);
  }

  response(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `← ${method} ${path} ${statusCode} (${duration}ms)`, context, undefined, duration);
  }
}

export const logger = new Logger();
