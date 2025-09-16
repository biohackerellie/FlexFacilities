import { type LogFormat, Logger, type LogLevel } from './logger';

const logLevel = (process.env.LOG_LEVEL as LogLevel) ?? 'info';
const logFormat: LogFormat =
  process.env.NODE_ENV === 'production' ? 'json' : 'pretty';

export const logger = new Logger(logLevel, logFormat);
