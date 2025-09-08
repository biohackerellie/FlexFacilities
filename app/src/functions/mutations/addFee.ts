'use server';

import { revalidateTag } from 'next/cache';
import { eq, sql } from 'drizzle-orm';

import { db } from '@local/db/client';
import { ReservationFees } from '@local/db/schema';

interface IForminput {
  additionalFees: any;
  feesType: string;
}
/**
 * @deprecated
 *  TODO: rewrite this in golang
 */
export default async function addFee(data: IForminput, id: any) {
  try {
    await db.insert(ReservationFees).values({
      additionalFees: parseInt(data.additionalFees),
      feesType: data.feesType,
      reservationId: id,
    });
    return revalidateTag('reservations');
  } catch (error) {
    throw new Error();
  }
}
