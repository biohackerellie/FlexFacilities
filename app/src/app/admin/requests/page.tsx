import { cacheTag } from 'next/cache';
import * as React from 'react';
import { DataTable } from '@/components/ui/tables';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
import type { FullResWithFacilityName } from '@/lib/types';
import { columns } from './columns';
import TableSkeleton from './skeleton';

async function getData(session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.reservations().getAllPending({});

  if (error) {
    logger.error(error.message);
    return [] as FullResWithFacilityName[];
  }
  if (!data) {
    return [] as FullResWithFacilityName[];
  }
  cacheTag('requests');
  return data.data;
}

async function TableWrapper() {
  const { session, token } = await getCookies();
  if (!session || !token) {
    return null;
  }
  const data = await getData(session, token);

  return <DataTable columns={columns} data={data} />;
}

export default async function Requests() {
  return (
    <div className='space-y-7'>
      <div>
        <h1 className='text-lg font-medium'>Requests</h1>
      </div>
      <React.Suspense fallback={<TableSkeleton />}>
        <TableWrapper />
      </React.Suspense>
    </div>
  );
}
