import { cache } from 'react';
import { logger } from '../logger';
import { client } from '../rpc';

export const getBranding = cache(async () => {
  const { data, error } = await client.utility().getBranding({});
  if (error) {
    logger.error('Error fetching branding', { 'error ': error });
    return null;
  }

  return data;
});
