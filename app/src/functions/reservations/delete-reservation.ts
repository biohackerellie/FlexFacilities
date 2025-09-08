'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { eq } from 'drizzle-orm';

import { db } from '@local/db/client';
import { Reservation } from '@local/db/schema';

/**
 * @deprecated
 *  TODO: rewrite this in golang
 */
export default async function HandleDelete(id: number) {
  try {
    await db.delete(Reservation).where(eq(Reservation.id, id));
  } catch (error) {
    throw new Error();
  }
  return revalidateTag('reservations');
}
