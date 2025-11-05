'use server';

import { cacheTag } from 'next/cache';
import { client } from '@/lib/rpc';
export async function requestCount(session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.reservations().requestCount({});
  if (error) return 0;
  const count = data?.count ?? 0;
  cacheTag('requests');
  return count;
}
