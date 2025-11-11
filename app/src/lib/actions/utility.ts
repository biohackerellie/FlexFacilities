'use server';
import { logger } from '../logger';
import { client } from '../rpc';

async function fetchBranding() {
  const { data, error } = await client.utility().getBranding({});
  if (error) {
    logger.error('Error fetching branding', { 'error ': error });
    return undefined;
  }

  return data;
}

export async function getBranding() {
  return await fetchBranding();
}
