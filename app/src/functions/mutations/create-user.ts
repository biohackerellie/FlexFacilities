'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { client } from '@/lib/rpc';

const formSchema = z
  .object({
    email: z.email().min(5),
    password: z.string().min(5),
    name: z.string().min(5),
    confirmPassword: z.string().min(5),
    terms: z.union([z.literal('true'), z.literal('false'), z.boolean()]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.terms !== 'true', {
    message: 'You must agree to the terms and conditions',
  });
type FormSchema = z.infer<typeof formSchema>;
export default async function CreateUser(formData: FormData) {
  const initial: FormSchema = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    terms: Boolean(formData.get('terms') as string),
  };
  const data = formSchema.safeParse(initial);
  if (!data.success) {
    throw data.error;
  }
  const user = data.data;
  try {
    await client.auth().register({
      name: user.name,
      email: user.email,
      password: user.password,
    });
    console.log('User created');
  } catch (error) {
    console.log(error);
    throw error;
  }

  revalidateTag('users');
  redirect('/login');
}
