import pino from 'pino';

// Production-grade Pino logger instance with automatic sensitive field redaction
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  // Redact sensitive authorization headers, secrets, and signatures from all log streams
  redact: {
    paths: [
      '*.password',
      '*.secret',
      '*.key_secret',
      '*.RAZORPAY_KEY_SECRET',
      '*.authorization',
      '*.token',
      '*.signature',
      'headers.authorization',
      'req.headers.authorization',
    ],
    censor: '[REDACTED]',
  },
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'freelance-escrow-api',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Creates a child logger scoped to a specific module or request ID
 */
export function getLogger(moduleName: string, meta: Record<string, any> = {}) {
  return logger.child({ module: moduleName, ...meta });
}
