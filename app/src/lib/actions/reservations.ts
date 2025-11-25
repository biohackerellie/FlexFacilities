'use server';
import { cacheTag, revalidatePath, revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import type { FormData as CreateReservationSchema } from '../form-store';
import { getCookies } from '../setHeader';
import type { Reservation, ReservationStatus } from '../types';

export async function createReservation(formData: CreateReservationSchema) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed.reservations().createReservation({
    userId: formData.userID,
    eventName: formData.eventName,
    facilityId: formData.facilityID,
    details: formData.details,
    pricingId: formData.pricingID,
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
  revalidateTag('requests', 'max');
}

interface IForminput {
  additionalFees: number;
  feesType: string;
  reservationId: any;
}

export async function addFee(data: IForminput, id: string) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed.reservations().updateReservationFee({
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

export async function getReservation(
  id: string,
  session: string,
  token: string,
) {
  'use cache: private';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed
    .reservations()
    .getReservation({ id: id });
  if (error) {
    logger.error('Error fetching reservation', { 'error ': error });
    return null;
  }

  cacheTag('reservation', id);

  return data;
}

export async function getReservationPricing(
  id: string,
  session: string,
  token: string,
) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed
    .facilities()
    .getPricing({ pricingId: id });
  if (error) {
    logger.error('Error fetching reservation', { 'error ': error });
    return null;
  }
  return data;
}

export async function costReducer(id: string, session: string, token: string) {
  'use cache: private';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.reservations().costReducer({ id: id });

  if (error) {
    logger.error('Error fetching cost reducer', { 'error ': error });
    return null;
  }

  return data;
}

export async function updateReservation(reservation: Reservation) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed
    .reservations()
    .updateReservation({ reservation });

  if (error) {
    logger.error('Error updating reservation', { 'error ': error });
    return { message: error.message };
  }
  revalidateTag('reservations', 'max');
  revalidateTag(`reservation-${reservation.id}`, 'max');
  revalidatePath(`/reservation/${reservation.id}`, 'layout');
  revalidatePath(`/admin/reservations`, 'page');

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
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed.reservations().createReservationDates({
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
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed
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
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed
    .reservations()
    .updateReservationDatesStatus({ ids: ids, status: status });
  if (error) {
    logger.error('Error updating reservation', { 'error ': error });
    throw error;
  }
  revalidateTag('reservations', 'max');
}

export async function DeleteReservation(id: string) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed.reservations().deleteReservation({ id: id });
  if (error) {
    logger.error('Error deleting reservation', { error: error });
    throw error;
  }
  revalidateTag('reservations', 'max');
  revalidatePath('/admin/reservations', 'page');
}

export async function DeleteDates(ids: string[]) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed
    .reservations()
    .deleteReservationDates({ id: ids });

  if (error) {
    logger.error('Error deleting date', { error: error });
    throw error;
  }
  revalidateTag('reservations', 'max');
}

export async function AggregateChartData(session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.utility().aggregateChartData({});

  if (error) {
    logger.error('Error fetching aggregate chart data', { 'error ': error });
    throw error;
  }
  cacheTag('chartData');
  return data;
}

export async function uploadReservationDocument(
  reservationID: string,
  formData: FormData,
) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const url = new URL(
    `${process.env.FRONTEND_URL}/api/files/documents/${reservationID}`,
  );

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        // Don't set Content-Type manually - let fetch set it with boundary
        'X-Session': session,
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (error) {
    throw new Error('error uploading file', { cause: error });
  }

  revalidateTag('reservations', 'max');
  revalidateTag(`reservation-${reservationID}`, 'max');
  revalidatePath(`/reservation/${reservationID}/Insurance`, 'page');
}
