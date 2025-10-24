'use server';
import { revalidateTag } from 'next/cache';
import * as z from 'zod';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';

export type FormState =
  | {
      errors?:
        | {
            email?:
              | {
                  errors: string[];
                }
              | undefined;
            password?:
              | {
                  errors: string[];
                }
              | undefined;
          }
        | undefined;
      message?: string;
    }
  | undefined;

const _loginSchema = z.object({
  email: z.email('Email is required').trim(),
  password: z.string().min(2, 'Password must be at least 8 characters').trim(),
});

export async function Login(email: string, password: string) {
  logger.info('Login', { email, password });
  const { error } = await client
    .auth()
    .login({ email: email, password: password });

  if (error) {
    logger.error(error.message);
    throw new Error(error.message);
  }
}

export type RegisterFormState =
  | {
      errors?:
        | {
            name?:
              | {
                  errors: string[];
                }
              | undefined;
            email?:
              | {
                  errors: string[];
                }
              | undefined;
            password?:
              | {
                  errors: string[];
                }
              | undefined;
            confirmPassword?:
              | {
                  errors: string[];
                }
              | undefined;
          }
        | undefined;
      message?: string;
    }
  | undefined;

const passwords = z
  .object({
    password: z.string().min(8, 'Password must be 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
const _registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.email('Email is required').trim(),
  passwords: passwords,
});

export async function CreateUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const { error } = await client.auth().register({
    name,
    email,
    password,
  });
  if (error) {
    throw error;
  }
}

export async function Email2FA(token: string, code: string) {
  const { data, error } = await client.auth().verify2FACode({ token, code });
  if (error) {
    throw error;
  }
  if (!data || !data.authorized) {
    throw new Error('Invalid code');
  }
  revalidateTag('session', 'max');
}

export async function RequestPasswordReset(email: string) {
  const { error } = await client.auth().requestResetPassword({ email });
  if (error) {
    throw error;
  }
}

export async function ResetPassword(email: string, password: string) {
  const { error } = await client.auth().resetPassword({ email, password });
  if (error) {
    throw error;
  }
}
