'use client';
import * as React from 'react';
import { ReservationContext } from './context';

import dynamic from 'next/dynamic';
import { DataTable } from '@/components/ui/tables/reservations/reservation/data-table';
import { adminColumns } from './adminColumns';
import { columns } from './columns';
export default function DatesTables({ isAdmin }: { isAdmin: boolean }) {
  const data = React.use(ReservationContext);
  if (!data) return <div>no data</div>;
  const reservation = data.reservation!;
  const mappedDates = data.dates;
  const AddDates = dynamic(() => import('@/components/ui/alerts/addDates'));

  if (isAdmin) {
    return (
      <>
        <DataTable columns={adminColumns} data={mappedDates} />
        <div className="float-right">
          <AddDates id={reservation.id} />
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
