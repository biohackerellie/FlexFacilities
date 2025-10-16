'use server';
import { revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { FormData as CreateReservationSchema } from '../form-store';
import { Reservation, ReservationStatus } from '../types';

export async function createReservation(formData: CreateReservationSchema) {
  logger.debug('Creating reservation', { formData });
  const { error } = await client.reservations().createReservation({
    userId: formData.userID,
    eventName: formData.eventName,
    facilityId: formData.facilityID,
    details: formData.details,
    categoryId: formData.categoryID,
    name: formData.name,
    phone: formData.phone,
    techSupport: formData.techSupport,
    techDetails: formData.techDetails,
    doorAccess: formData.doorAccess,
    doorsDetails: formData.doorDetails,
    occurrences: formData.occurrences,
    startDate: formData.startDate,
    startTime: formData.startTime,
    endDate: formData.endDate,
    endTime: formData.endTime,
    pattern: formData.pattern,
  });

  if (error) {
    logger.error('Error creating reservation', { 'error ': error });
    throw error;
  }
  revalidateTag('reservations', 'max');
}

interface IForminput {
  additionalFees: number;
  feesType: string;
  reservationId: any;
}

export async function addFee(data: IForminput, id: string) {
  const { error } = await client.reservations().updateReservationFee({
    fee: {
      additionalFees: String(data.additionalFees),
      feesType: data.feesType,
      reservationId: id,
    },
  });
  if (error) {
    logger.error('Error adding fee', { 'error ': error });
    throw error;
  }
  revalidateTag('reservations', 'max');
  revalidateTag(String(id), 'max');
}

export async function getReservation(id: string) {
  const { data, error } = await client
    .reservations()
    .getReservation({ id: id });
  if (error) {
    logger.error('Error fetching reservation', { 'error ': error });
    return null;
  }

  return data;
}

export async function getReservationCategory(id: string) {
  const { data, error } = await client.facilities().getCategory({ id: id });
  if (error) {
    logger.error('Error fetching reservation', { 'error ': error });
    return null;
  }

  return data;
}

export async function costReducer(id: string) {
  const { data, error } = await client.reservations().costReducer({ id: id });

  if (error) {
    logger.error('Error fetching cost reducer', { 'error ': error });
    return null;
  }

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
  revalidateTag('reservations', 'max');
  return { message: 'success' };
}

export async function AddDates({
  reservationID,
  localStart,
  localEnd,
}: {
  reservationID: string;
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
  revalidateTag('reservations', 'max');
}

export async function ApproveReservation(
  id: string,
  status: ReservationStatus,
) {
  const { error } = await client
    .reservations()
    .updateReservationStatus({ id: id, status: status });

  if (error) {
    logger.error('Error updating reservation', { 'error ': error });
    throw error;
  }
  revalidateTag('reservations', 'max');
  revalidateTag('requests', 'max');
}
export async function UpdateDateStatus(
  ids: string[],
  status: ReservationStatus,
) {
  const { error } = await client
    .reservations()
    .updateReservationDatesStatus({ ids: ids, status: status });
  if (error) {
    logger.error('Error updating reservation', { 'error ': error });
    throw error;
  }
  revalidateTag('reservations', 'max');
}

export async function DeleteDates(ids: string[]) {
  const { error } = await client
    .reservations()
    .deleteReservationDates({ id: ids });

  if (error) {
    logger.error('Error deleting date', { error: error });
    throw error;
  }
  revalidateTag('reservations', 'max');
}

export async function AggregateChartData() {
  const { data, error } = await client.utility().aggregateChartData({});

  if (error) {
    logger.error('Error fetching aggregate chart data', { 'error ': error });
    throw error;
  }
  return data;
}
