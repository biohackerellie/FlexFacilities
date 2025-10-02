'use server';

import { unstable_cacheTag as cacheTag } from 'next/cache';
import { client } from '@/lib/rpc';
export async function requestCount() {
  'use cache';
  const { data, error } = await client.reservations().requestCount({});
  cacheTag('reservations');
  if (error) return 0;
  const count = data?.count ?? 0;
  return count;
}
