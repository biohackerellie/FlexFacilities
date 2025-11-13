'use server';
import { cacheTag, revalidatePath, revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { getCookies } from '../setHeader';
import type { Notification } from '../types';

export async function getUser(id: string, session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data: user, error } = await authed.users().getUser({ id: id });
  if (error) {
    logger.error('Error fetching user', { 'error ': error });
    return null;
  }
  cacheTag('user', id);
  return user;
}

export async function getUserNotifications(
  id: string,
  session: string,
  token: string,
) {
  'use cache: private';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed
    .users()
    .getUserNotifications({ userId: id });
  if (error) {
    logger.error(error.message);
  }
  cacheTag(`notifications-${id}`);

  return data?.notifications ?? [];
}

export async function newNotification(notification: Partial<Notification>) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  const { error } = await authed.users().createNotification({ notification });
  if (error) {
    logger.error(error.message);
    throw error;
  }
  revalidateTag('notifications', 'max');
  revalidateTag(`notifications-${notification.userId}`, 'max');
  revalidatePath(`/admin/users/${notification.userId}`, 'page');
}
