'use server';
import { cacheTag } from 'next/cache';
import { logger } from '../logger';
import { client } from '../rpc';
import { getCookies } from '../setHeader';

async function fetchBranding(session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.utility().getBranding({});
  if (error) {
    logger.error('Error fetching branding', { 'error ': error });
    return undefined;
  }

  cacheTag('branding');
  return data;
}

export async function getBranding() {
  const { session, token } = await getCookies();
  if (!session || !token) {
    return undefined;
  }
  return await fetchBranding(session, token);
}
