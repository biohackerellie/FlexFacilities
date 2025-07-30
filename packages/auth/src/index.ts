import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@local/db/client';
import { sendEmail } from './email';

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  clientID: string;
  clientSecret: string;
  tenantId: string;
  prompt: 'select_account';
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    socialProviders: {
      microsoft: {
        clientId: options.clientID,
        clientSecret: options.clientSecret,
        tenantId: options.tenantId,
        prompt: options.prompt,
      },
    },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url, token }, request) => {
        await sendEmail({
          to: user.email,
          subject: 'Reset your password',
          text: `Click the link to reset your password: ${url}`,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }, request) => {
        await sendEmail({
          to: user.email,
          subject: 'Please verify your email',
          text: `Clieck the link to verify your email: ${url}`,
        });
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;

export type Session = Auth['$Infer']['Session'];
