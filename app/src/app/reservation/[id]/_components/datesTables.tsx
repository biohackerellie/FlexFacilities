'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { DataTable } from '@/components/ui/tables/reservations/reservation/data-table';
import { adminColumns } from './adminColumns';
import { columns } from './columns';
import { ReservationContext } from './context';
import AddDateDialog from './addDates';
export default function DatesTables({ isAdmin }: { isAdmin: boolean }) {
  const data = React.use(ReservationContext);
  if (!data) return <div>no data</div>;
  const reservation = data.reservation!;
  const mappedDates = data.dates;

  if (isAdmin) {
    return (
      <>
        <DataTable columns={adminColumns} data={mappedDates} />
        <div className="float-right">
          <AddDateDialog id={reservation.id} />
        </div>
      </>
    );
  } else {
    return (
      <>
        <DataTable columns={columns} data={mappedDates} />
      </>
    );
  }
}
