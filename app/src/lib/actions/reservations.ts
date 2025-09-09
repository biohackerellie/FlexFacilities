'use server';
import { client } from '@/lib/rpc';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { logger } from '@/lib/logger';

export async function getReservation(id: string) {
  'use cache';
  const { data, error } = await client
    .reservation()
    .getReservation({ id: BigInt(id) });
  if (error) {
    logger.error('Error fetching reservation', { 'error ': error });
    return null;
  }

  cacheTag('reservations', id);

  return data;
}

export async function getReservationCategory(id: string) {
  'use cache';
  const { data, error } = await client.facilities().get;
}
