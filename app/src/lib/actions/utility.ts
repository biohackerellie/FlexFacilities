'use server';
import { logger } from '../logger';
import { unauthenticatedClient as client } from '../rpc';

export async function getBranding() {
  'use cache';
  const { data, error } = await client.utility().getBranding({});
  if (error) {
    logger.error('Error fetching branding', { 'error ': error });
    return undefined;
  }
  return data ?? undefined;
}
