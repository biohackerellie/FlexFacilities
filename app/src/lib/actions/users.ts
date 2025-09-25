'use server';
import { unstable_cacheTag as cacheTag, revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { Notification } from '../types';

export async function getUser(id: string) {
  'use cache';
  const { data: user, error } = await client.users().getUser({ id: id });
  if (error) {
    logger.error('Error fetching user', { 'error ': error });
    return null;
  }
  cacheTag('users', id);
  return user;
}

export async function getUserNotifications(id: string) {
  'use cache';
  const { data, error } = await client
    .users()
    .getUserNotifications({ userId: id });
  if (error) {
    logger.error(error.message);
  }
  cacheTag('notifications', id);
  return data?.notifications ?? [];
}

export async function newNotification(notification: Partial<Notification>) {
  const { error } = await client.users().createNotification({ notification });
  if (error) {
    logger.error(error.message);
    throw error;
  }
  revalidateTag('notifications');
  revalidateTag(notification?.userId!);
}
