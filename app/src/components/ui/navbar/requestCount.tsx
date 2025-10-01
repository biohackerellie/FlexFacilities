'use server';

import { client } from '@/lib/rpc';
import { unstable_cacheTag as cacheTag } from 'next/cache';
export async function requestCount() {
  'use cache';
  const { data, error } = await client.reservations().requestCount({});
  cacheTag('reservations');
  if (error) return 0;
  const count = data?.count ?? 0;
  return count;
}
