'use server';

import { client } from './rpc';
import { logger } from './logger';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { Session, UserRole } from './types';

function parseRole(role: string): UserRole {
  switch (role) {
    case 'ADMIN':
      return 'ADMIN';
    case 'USER':
      return 'USER';
    default:
      return 'USER';
  }
}
export async function auth() {
  'use cache';
  cacheTag('session');
  const { data, error } = await client.auth().getSession({});
  if (error) {
    logger.warn(error.message);
  }
  if (!data) return null;
  return {
    userEmail: data?.userEmail,
    userId: data?.userId,
    userName: data?.userName,
    userRole: parseRole(data?.userRole),
    sessionId: data?.sessionId,
  } as Session;
}
