'use server';

import { cacheTag } from 'next/cache';
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

export async function auth() {
  'use cache';
  // const { data, error } = await client.auth().getSession({});
  const data = await fetch('/api/auth/session').then((res) => res.json());
  cacheTag('session');

  // if (error) {
  //   logger.warn(error.message);
  // }
  if (!data) return null;

  console.log(data);
  return {
    userEmail: data?.userEmail,
    userId: data?.userId,
    userName: data?.userName,
    userRole: parseRole(data?.userRole),
    sessionId: data?.sessionId,
  } as Session;
}
