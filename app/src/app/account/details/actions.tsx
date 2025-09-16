'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/rpc';

export async function Update(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  try {
    await client.users().updateUser({ user: { id: id, name: name } });
  } catch (error) {
    throw new Error('Failed to update user');
  }

  return revalidatePath('/account/details', 'page');
}
