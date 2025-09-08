'use server';

import { client } from './rpc';
import { logger } from './logger';

export async function auth() {
  'use cache';
  const { data, error } = await client.auth().getSession({});
  if (error) {
    logger.warn(error.message);
  }
  return data;
}
