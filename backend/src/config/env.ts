import z from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before validation
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string({
    required_error: 'MONGODB_URI is required for database connection'
  }),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is required for session signing'
  }),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // BYOK encryption key (32 bytes = 64 hex characters) for AES-256-GCM credential storage
  ENCRYPTION_KEY: z.string({
    required_error: 'ENCRYPTION_KEY is required for secure credential storage'
  }).regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes)'),

  // AI configuration
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_API_KEY: z.string().optional(),
  AI_RATE_LIMIT_MAX: z.coerce.number().default(5),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('CRITICAL: Environment variable validation failed!');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
};

export const env = validateEnv();
export type EnvConfig = z.infer<typeof envSchema>;

