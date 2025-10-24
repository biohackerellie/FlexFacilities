'use server';
import { revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import type { Notification } from '../types';

export async function getUser(id: string) {
  const { data: user, error } = await client.users().getUser({ id: id });
  if (error) {
    logger.error('Error fetching user', { 'error ': error });
    return null;
  }
  return user;
}

export async function getUserNotifications(id: string) {
  const { data, error } = await client
    .users()
    .getUserNotifications({ userId: id });
  if (error) {
    logger.error(error.message);
  }
  return data?.notifications ?? [];
}

export async function newNotification(notification: Partial<Notification>) {
  const { error } = await client.users().createNotification({ notification });
  if (error) {
    logger.error(error.message);
    throw error;
  }
  revalidateTag('notifications', 'max');
  revalidateTag(notification?.userId!, 'max');
}
