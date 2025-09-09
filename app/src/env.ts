import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    CAL_API_KEY: z.string(),
    CRON_SECRET: z.string(),
    SQUARE_API_ID: z.string(),
    GMAIL_USER: z.string(),
    GMAIL_PASSWORD: z.string(),
    API_PORT: z.optional(z.number()).default(8080),
    API_HOST: z.optional(z.string()).default('http://0.0.0.0'),
    SQUARE_APP_ID: z.string(),
    SQUARE_LOCATION_ID: z.string(),
    SQUARE_TOKEN: z.string(),
    BLOB_READ_WRITE_TOKEN: z.string(),
    GITHUB_TOKEN: z.string(),
  },
  shared: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === 'lint',
});
