import winston from 'winston';
import { config } from './env.js';

const { combine, timestamp, errors, json, colorize, simple, printf } = winston.format;

// ─── Sensitive field redaction ─────────────────────────────────────────────────
const SENSITIVE_FIELDS = [
  'password', 'passwordHash', 'token', 'accessToken', 'refreshToken',
  'apiKey', 'secret', 'authorization', 'geminiKey', 'cloudinarySecret',
  'smtp_password', 'jwtSecret',
];

const redactSensitive = winston.format((info) => {
  const redact = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    const result = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((f) => lowerKey.includes(f));
      result[key] = isSensitive ? '[REDACTED]' : redact(obj[key]);
    }
    return result;
  };
  return redact(info);
});

// ─── Development format (human-readable) ──────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${ts} ${level}: ${stack || message}${metaStr}`;
  })
);

// ─── Production format (JSON) ─────────────────────────────────────────────────
const prodFormat = combine(
  redactSensitive(),
  timestamp(),
  errors({ stack: config.isDevelopment }),
  json()
);

// ─── Transports ───────────────────────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: config.isDevelopment ? devFormat : prodFormat,
    handleExceptions: true,
  }),
];

// In production, also write to rotating log files
if (config.isProduction) {
  // Dynamically import for optional use
  try {
    const { default: DailyRotateFile } = await import('winston-daily-rotate-file');
    transports.push(
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '14d',
        format: prodFormat,
      }),
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '7d',
        format: prodFormat,
      })
    );
  } catch {
    // File logging unavailable — console only
  }
}

// ─── Logger instance ──────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  transports,
  exitOnError: false,
});

// Convenience stream for Morgan HTTP logging
export const morganStream = {
  write: (message) => logger.http(message.trim()),
};
