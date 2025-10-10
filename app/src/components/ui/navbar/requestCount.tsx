'use server';

import { client } from '@/lib/rpc';
export async function requestCount() {
  const { data, error } = await client.reservations().requestCount({});
  if (error) return 0;
  const count = data?.count ?? 0;
  return count;
}
