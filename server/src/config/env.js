const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables from .env file
dotenv.config();

const envSchema = z
  .object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_ORIGIN: z.string().min(1, 'CLIENT_ORIGIN is required'),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('1d'),
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
    GEMINI_FALLBACK_MODEL: z.string().default('gemini-3.5-flash'),
    GEMINI_MODEL_CHAIN: z.string().optional(),
    GEMINI_MAX_ATTEMPTS: z.coerce.number().min(1).max(5).default(5),
    GEMINI_DEADLINE_MS: z.coerce.number().min(10000).max(120000).default(50000),
    DAILY_ANALYSIS_LIMIT: z.coerce.number().default(20),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).optional(),
    COOKIE_SECURE: z.coerce.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production' && data.COOKIE_SECURE === false) {
        return false;
      }
      return true;
    },
    {
      message: 'COOKIE_SECURE cannot be false in production',
      path: ['COOKIE_SECURE'],
    }
  )
  .refine(
    (data) => {
      const isProd = data.NODE_ENV === 'production';
      const effectiveSameSite = data.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax');
      const effectiveSecure = data.COOKIE_SECURE !== undefined ? data.COOKIE_SECURE : isProd;
      if (effectiveSameSite === 'none' && !effectiveSecure) {
        return false;
      }
      return true;
    },
    {
      message: 'SameSite=none requires Secure=true',
      path: ['COOKIE_SAME_SITE'],
    }
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('FATAL: Environment variable validation failed:');
  parsed.error.issues.forEach((issue) => {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

module.exports = parsed.data;
