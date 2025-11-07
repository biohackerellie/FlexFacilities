import { cache } from 'react';
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

export const auth = cache(async (): Promise<Session | null> => {
  const { session, token } = await getCookies();
  if (!session || !token) {
    return null;
  }

  const authed = client.withAuth(session, token);
  const { data, error } = await authed.auth().getSession({});

  if (error) {
    logger.debug('Failed to get session', { error });
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    userRole: parseRole(data?.userRole),
  } as Session;
});
