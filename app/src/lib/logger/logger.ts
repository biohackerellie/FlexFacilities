import chalk from 'chalk';

export type LogLevel = 'info' | 'error' | 'debug' | 'warn';
export type LogFormat = 'pretty' | 'json';
export type LogMethod = 'error' | 'warn' | 'info' | 'debug' | 'success';

export class Logger {
  private logLevel: LogLevel;
  private logFormat: LogFormat;
  constructor(logLevel: LogLevel = 'info', logFormat: LogFormat = 'pretty') {
    this.logLevel = logLevel;
    this.logFormat = logFormat;
  }

  private shouldLog(level: LogMethod): boolean {
    const levels: Record<LogLevel, LogMethod[]> = {
      error: ['error'],
      warn: ['error', 'warn'],
      info: ['error', 'warn', 'info', 'success'],
      debug: ['error', 'warn', 'info', 'success', 'debug'],
    };

    return levels[this.logLevel].includes(level);
  }
  private log(
    level: LogMethod,
    message: string,
    context?: Record<string, unknown>,
  ) {
    if (!this.shouldLog(level)) return;
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase();

    if (this.logFormat === 'json') {
      const logEntry = {
        time: timestamp,
        level: levelUpper,
        ...this.getSourceLocation(),
        msg: message,
        ...context,
      };
      this.jsonLog(level, logEntry);
    } else {
      this.prettyLog(level, levelUpper, message, context);
    }
  }

  private jsonLog(level: LogMethod, entry: Record<string, unknown>) {
    const jsonString = JSON.stringify(entry);
    switch (level) {
      case 'error':
        console.error(jsonString);
        break;
      case 'warn':
        console.warn(jsonString);
        break;
      default:
        console.log(jsonString);
    }
  }

  private prettyLog(
    level: LogMethod,
    levelUpper: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    const color = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.blue,
      debug: chalk.magenta,
      success: chalk.green,
    }[level];

    const styledMessage = [
      color(chalk.bold(`[${levelUpper}]`)),
      message,
      context ? chalk.gray(JSON.stringify(context, null, 2)) : '',
    ].join(' ');

    switch (level) {
      case 'error':
        console.error(styledMessage);
        break;
      case 'warn':
        console.warn(styledMessage);
        break;
      default:
        console.log(styledMessage);
    }
  }
  private getSourceLocation() {
    const error = new Error();
    if (!error.stack) return {};

    const stackLines = error.stack.split('\n');
    return { src: stackLines[4]?.trim() };
  }
  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  success(message: string, context?: Record<string, unknown>) {
    this.log('success', message, context);
  }
}
