'use server';

import { client } from '@/lib/rpc';
import { revalidateTag } from 'next/cache';

import type { CreateFacilitySchema } from './form';
import type { Facility, Category } from '@/lib/types';
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
