'use server';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';

export async function getUser(id: string) {
  'use cache';
  const { data: user, error } = await client.users().getUser({ id: id });
  if (error) {
    logger.error('Error fetching user', { 'error ': error });
    return null;
  }
  cacheTag('users', id);
  return user;
}
