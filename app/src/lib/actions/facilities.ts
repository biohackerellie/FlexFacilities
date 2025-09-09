'use server';
import { client } from '@/lib/rpc';
import { unstable_cacheTag as cacheTag } from 'next/cache';

export async function getFacility(id: string) {
  'use cache';
  const { data: facility, error } = await client
    .facilities()
    .getFacility({ id: BigInt(id) });

  cacheTag('facilities', id);

  if (error || !facility) {
    return null;
  }
  return facility;
}

export async function getEventsByFacility(id: string) {
  'use cache';
  const { data: events, error } = await client
    .facilities()
    .getEventsByFacility({ id: BigInt(id) });
  if (error || !events) {
    return null;
  }
  cacheTag('events', id);
  return events;
}
