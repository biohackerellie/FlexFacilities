import { DataTable } from '@/components/ui/tables';
import * as React from 'react';
import { columns } from './columns';
import { client } from '@/lib/rpc';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import type { TableReservation } from './columns';
import { logger } from '@/lib/logger';
import TableSkeleton from './skeleton';

async function getData() {
  'use cache';
  const { data, error } = await client.reservations().getAllPending({});

  if (error) {
    logger.error(error.message);
    return [] as TableReservation[];
  }
  if (!data) {
    return [] as TableReservation[];
  }
  const response: TableReservation[] = data.data.map((r) => {
    const reservation = r.resWrap?.reservation;
    if (!reservation) {
      return {} as TableReservation;
    }
    return {
      eventName: reservation.name ?? 'N/A',
      Facility: r.facilityName ?? 'N/A',
      ReservationDate: r.resWrap?.dates[0]?.localStart ?? 'N/A',
      approved: reservation.approved ?? 'N/A',
      User: r.userName ?? 'unknown',
      Id: reservation.id,
    } as TableReservation;
  });
  cacheTag('requests');
  return response;
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
