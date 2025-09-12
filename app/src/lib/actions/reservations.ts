'use server';
import { client } from '@/lib/rpc';
import { unstable_cacheTag as cacheTag, revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { Reservation, ReservationDate } from '../types';

export async function getReservation(id: string) {
  'use cache';
  const { data, error } = await client
    .reservations()
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
  const { data, error } = await client
    .facilities()
    .getCategory({ id: BigInt(id) });
  if (error) {
    logger.error('Error fetching reservation', { 'error ': error });
    return null;
  }

  return data;
}

export async function costReducer(id: string) {
  'use cache';
  const { data, error } = await client
    .reservations()
    .costReducer({ id: BigInt(id) });

  if (error) {
    logger.error('Error fetching cost reducer', { 'error ': error });
    return null;
  }
  cacheTag('r-cost', id);

  return data;
}

export async function updateReservation(reservation: Reservation) {
  const { error } = await client
    .reservations()
    .updateReservation({ reservation });

  if (error) {
    logger.error('Error updating reservation', { 'error ': error });
    return { message: error.message };
  }
  revalidateTag('reservations');
  return { message: 'success' };
}

export async function AddDates({
  reservationID,
  localStart,
  localEnd,
}: {
  reservationID: bigint;
  localStart: string;
  localEnd: string;
}) {
  const { error } = await client.reservations().createReservationDates({
    date: [
      {
        reservationId: reservationID,
        localStart: localStart,
        localEnd: localEnd,
      },
    ],
  });

  if (error) {
    logger.error('Error updating reservation', { 'error ': error });
    throw error;
  }
  revalidateTag('reservations');
}
