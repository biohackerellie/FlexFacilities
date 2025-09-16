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
  password: z.string().min(8, 'Password must be at least 8 characters').trim(),
});
export async function Login(
  _state: any,
  formData: FormData,
): Promise<FormState> {
  'use server';
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
