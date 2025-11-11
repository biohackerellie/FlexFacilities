import { cookies } from 'next/headers';
import { logger } from './logger';
import { client } from './rpc';
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
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.auth().getSession({});
  if (error) {
    return null;
  }
  return data;
}

export const auth = async (): Promise<Session | null> => {
  // DO NOT CACHE: Auth state depends on request-specific cookies
  // Caching causes users to get stale auth results in production
  const cookieStore = await cookies();
  let session = '';
  let token = '';
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes('flexauth_token')) {
      token = cookie.value;
    }
    if (cookie.name.includes('flexauth_session')) {
      session = cookie.value;
    }
  }

  const data = await fetchSession(session, token);
  if (!data) {
    return null;
  }

  return {
    ...data,
    userRole: parseRole(data?.userRole),
  } as Session;
};
