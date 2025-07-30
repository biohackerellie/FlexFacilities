import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

import { env as authEnv } from "@local/auth/env";

export const env = createEnv({
  extends: [vercel(), authEnv],
  server: {
    RESET_SECRET: z.string(),
    NEXTAUTH_URL: z.string(),
    CAL_API_KEY: z.string(),
    RSA_PRIVATE_KEY: z.string(),
    RSA_PUBLIC_KEY: z.string(),
    DIRECT_URL: z.string(),
    DATABASE_URL: z.string(),
    CRON_SECRET: z.string(),
    SQUARE_API_ID: z.string(),
    GMAIL_USER: z.string(),
    GMAIL_PASSWORD: z.string(),
    HOSTNAME: z.string(),
    PORT: z.string(),
    HOST: z.string(),
    EMAIL_API_KEY: z.string(),
    SQUARE_APP_ID: z.string(),
    SQUARE_LOCATION_ID: z.string(),
    SQUARE_TOKEN: z.string(),
    GOOGLE_CAL_USER: z.string(),
    GOOGLE_CAL_PASS: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_ACCESS_TOKEN: z.string(),
    GOOGLE_REFRESH_TOKEN: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),
    GOOGLE_API_KEY: z.string(),
    S3_USER: z.string(),
    S3_PASSWORD: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET: z.string(),
    S3_HOST: z.string(),
    S3_URL: z.string(),
    RESEND_API: z.string(),
    BLOB_READ_WRITE_TOKEN: z.string(),
    GITHUB_TOKEN: z.string(),
  },
  client: {
    NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: z.string(),
    NEXT_PUBLIC_ENABLE_AZURE_AUTH: z.string(),
    NEXT_PUBLIC_HOST: z.string(),
    NEXT_PUBLIC_EMAIL_API: z.string(),
    NEXT_PUBLIC_GA_TRACKING_ID: z.string(),
  },
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH,
    NEXT_PUBLIC_ENABLE_AZURE_AUTH: process.env.NEXT_PUBLIC_ENABLE_AZURE_AUTH,
    NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST,
    NEXT_PUBLIC_EMAIL_API: process.env.NEXT_PUBLIC_EMAIL_API,
    NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  },
  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview",
});
