'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';

export async function Update(id: string, formData: FormData) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const name = formData.get('name') as string;
  try {
    await authed.users().updateUser({ user: { id: id, name: name } });
  } catch (_error) {
    throw new Error('Failed to update user');
  }

  return revalidatePath('/account/details', 'page');
}
