import dotenv from 'dotenv';
dotenv.config();

// ─── Environment Detection ───────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

// ─── Required variable definitions ────────────────────────────────────────────
const REQUIRED_VARS = isProduction
  ? ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']
  : ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

// ─── Fail-fast validation ─────────────────────────────────────────────────────
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[Config] FATAL: Missing required environment variables:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

// ─── Warn about insecure defaults in production ───────────────────────────────
if (isProduction && !process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('[Config] WARNING: CLOUDINARY_CLOUD_NAME not set. File uploads will be unavailable.');
}
if (isProduction && !process.env.GEMINI_API_KEY) {
  console.warn('[Config] WARNING: GEMINI_API_KEY not set. AI features will be unavailable.');
}
if (isProduction && !process.env.SMTP_HOST) {
  console.warn('[Config] WARNING: SMTP_HOST not set. Email notifications will be unavailable.');
}

// ─── Exported config ──────────────────────────────────────────────────────────
export const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || 'development',
  isProduction,
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Database (MongoDB)
  mongoUri: process.env.MONGODB_URI,

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS
  corsOrigin: process.env.CLIENT_URL || 'http://localhost:3000',

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 30000,
    maxRetries: parseInt(process.env.GEMINI_MAX_RETRIES, 10) || 2,
  },

  // Email / SMTP
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'PlaceX <noreply@placex.app>',
  },

  // Rate limits
  rateLimit: {
    general: { windowMs: 15 * 60 * 1000, max: 200 },
    auth:    { windowMs: 15 * 60 * 1000, max: 20 },
    strict:  { windowMs: 60 * 60 * 1000, max: 5 },
    ai:      { windowMs: 60 * 1000,      max: 10 },
    upload:  { windowMs: 60 * 1000,      max: 5 },
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // File upload
  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
    allowedMimeTypes: [
      'application/pdf',
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/octet-stream',
    ],
    allowedExtensions: ['.pdf', '.docx', '.doc', '.txt'],
  },
};
