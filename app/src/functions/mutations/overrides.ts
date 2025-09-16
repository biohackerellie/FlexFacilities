'use server';

import { db } from '@local/db/client';
import { Reservation } from '@local/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';

import { api } from '@/trpc/server';
/**
 * @deprecated
 *  TODO: rewrite this in golang
 */
export async function costChange(id: number, formData: FormData) {
  let value;
  const cost = formData.get('newCost');
  if (cost === null || cost === undefined) {
    value = null;
  } else {
    //@ts-expect-error
    value = parseInt(cost, 10);
  }
  try {
    await db
      .update(Reservation)
      .set({
        costOverride: value,
      })
      .where(eq(Reservation.id, id));
    return revalidateTag('reservations');
  } catch (error) {
    throw new Error();
  }
}
/**
 * @deprecated
 *  TODO: rewrite this in golang
 */
export async function facilityChange(id: number, data: any) {
  const facilityID = parseInt(data, 10);
  try {
    await db
      .update(Reservation)
      .set({
        facilityId: facilityID,
      })
      .where(eq(Reservation.id, id));

    return revalidateTag('reservations');
  } catch (error) {
    throw new Error();
  }
}
/**
 * @deprecated
 *  TODO: rewrite this in golang
 */
export async function categoryChange(id: number, facilityID: any, data: any) {
  const categories = await api.category.byFacility({
    facilityId: Number(facilityID),
    name: `%${data}%`,
  });
  const categoryID = categories?.id;
  try {
    await db
      .update(Reservation)
      .set({
        categoryId: categoryID,
      })
      .where(eq(Reservation.id, id));
    return revalidateTag('reservations');
  } catch (error: any) {
    throw new Error();
  }
}
