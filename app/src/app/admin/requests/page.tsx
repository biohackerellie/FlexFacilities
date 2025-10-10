import * as React from 'react';
import { DataTable } from '@/components/ui/tables';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import type { FullResWithFacilityName } from '@/lib/types';
import { columns } from './columns';
import TableSkeleton from './skeleton';

async function getData() {
  // TODO: cache
  const { data, error } = await client.reservations().getAllPending({});

  if (error) {
    logger.error(error.message);
    return [] as FullResWithFacilityName[];
  }
  if (!data) {
    return [] as FullResWithFacilityName[];
  }
  return data.data;
}

export default async function Requests() {
  const data = await getData();
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-lg font-medium">Requests</h1>
      </div>
      <React.Suspense fallback={<TableSkeleton />}>
        <DataTable columns={columns} data={data} />
      </React.Suspense>
    </div>
  );
}
