'use server';

import { revalidateTag } from 'next/cache';
import { client } from '@/lib/rpc';
import type { Category, Facility } from '@/lib/types';
import type { CreateFacilitySchema } from './form';
export async function createFacility(facility: CreateFacilitySchema) {
  const fac: Partial<Facility> = {
    name: facility.name,
    buildingId: BigInt(facility.buildingId),
    capacity: BigInt(facility.capacity),
    googleCalendarId: facility.googleCalendarId,
  };

  const categories: Partial<Category>[] = [
    {
      name: 'Category 1',
      price: parseFloat(facility.category1),
    },
    {
      name: 'Category 2',
      price: parseFloat(facility.category2),
    },
    {
      name: 'Category 3',
      price: parseFloat(facility.category3),
    },
  ];

  const { error } = await client
    .facilities()
    .createFacility({ facility: fac, categories: categories });

  if (error) {
    throw error;
  }

  revalidateTag('facilities');
}
