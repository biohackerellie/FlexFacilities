'use server';
import * as z from 'zod';
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

const loginSchema = z.object({
  email: z.email('Email is required').trim(),
  password: z.string().min(2, 'Password must be at least 8 characters').trim(),
});

export async function Login(
  _state: any,
  formData: FormData,
): Promise<FormState> {
  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!validated.success) {
    return {
      errors: z.treeifyError(validated.error).properties,
      message: 'Invalid form data',
    };
  }

  const { error } = await client
    .auth()
    .login({ email: validated.data.email, password: validated.data.password });

  if (error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'Login successful',
  };
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
const registerSchema = z.object({
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
