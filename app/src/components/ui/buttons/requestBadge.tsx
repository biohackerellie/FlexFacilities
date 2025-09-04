import * as React from 'react';

import { client } from '@/lib/rpc';
import { Badge } from '../badge';

export default async function RequestBadge(props: { requestCount: number }) {
  const { data: requestCount, error } = await client
    .reservation()
    .requestCount({});
  if (error || !requestCount) return null;

  return <Badge className="animate-pulse">{requestCount.count}</Badge>;
}
