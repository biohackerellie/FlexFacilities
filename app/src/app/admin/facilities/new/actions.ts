'use server';

import { revalidateTag } from 'next/cache';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
import type { Facility } from '@/lib/types';
import type { CreateFacilitySchema } from './form';
export async function createFacility(facility: CreateFacilitySchema) {
  const fac: Partial<Facility> = {
    name: facility.name,
    buildingId: facility.buildingId,
    capacity: facility.capacity,
    productId: facility.productId,
    googleCalendarId: facility.googleCalendarId,
  };

  const { session: sessionId, token } = await getCookies();
  if (!sessionId || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(sessionId, token);

  const { error } = await authed.facilities().createFacility({ facility: fac });

  if (error) {
    throw error;
  }

  revalidateTag('facilities', 'max');
}
