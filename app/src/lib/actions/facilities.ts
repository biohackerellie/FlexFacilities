'use server';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { client } from '@/lib/rpc';
import { logger } from '../logger';

export async function getFacility(id: string) {
  'use cache';
  const { data: facility, error } = await client
    .facilities()
    .getFacility({ id: BigInt(id) });

  cacheTag('facilities', id);

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  return facility;
}

export async function getEventsByFacility(id: string) {
  'use cache';
  const { data: events, error } = await client
    .facilities()
    .getEventsByFacility({ id: BigInt(id) });
  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  cacheTag('events', id);
  return events;
}

export async function getFacilities() {
  'use cache';
  const { data, error } = await client.facilities().getAllFacilities({});

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }

  return data;
}
