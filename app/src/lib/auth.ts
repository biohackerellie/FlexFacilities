'use server';

import { cacheTag } from 'next/cache';
import { logger } from './logger';
import { client } from './rpc';
import { getCookies } from './setHeader';
import type { Session, UserRole } from './types';

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

async function fetchSession(session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.auth().getSession({});
  cacheTag('session');
  if (error) {
    logger.debug('Failed to get session', { error });
    return null;
  }
  return data;
}

export async function auth() {
  const { session, token } = await getCookies();
  if (!session || !token) {
    return null;
  }
  const data = await fetchSession(session, token);
  if (!data) return null;

  return {
    ...data,
    userRole: parseRole(data?.userRole),
  } as Session;
}
