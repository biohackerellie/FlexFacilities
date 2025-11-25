'use server';
import { redirect } from 'next/navigation';
import { logger } from '../logger';
import { client } from '../rpc';
import { getCookies } from '../setHeader';

export async function checkout(reservationId: string) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('You must be logged int');
  }
  const { data, error } = await client
    .withAuth(session, token)
    .payments()
    .createPaymentSession({ reservationId: reservationId });
  if (error) {
    logger.error('Error creating payment session', { 'error ': error });
    throw error;
  }
  if (!data) {
    throw new Error('No data');
  }

  redirect(data.url);
}
