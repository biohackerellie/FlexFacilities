'use server';
import * as React from 'react';
import { logger } from '../logger';
import { client } from '../rpc';

export const getBranding = React.cache(async () => {
  const { data, error } = await client.utility().getBranding({});
  if (error) {
    logger.error('Error fetching branding', { 'error ': error });
    return undefined;
  }
  return data ?? undefined;
});
