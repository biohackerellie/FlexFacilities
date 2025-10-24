'use client';

import * as React from 'react';
import { DataTable } from '@/components/ui/tables/reservations/reservation/data-table';
import AddDateDialog from './addDates';
import { adminColumns } from './adminColumns';
import { columns } from './columns';
import { ReservationContext } from './context';
export default function DatesTables({ isAdmin }: { isAdmin: boolean }) {
  const data = React.use(ReservationContext);
  if (!data) return <div>no data</div>;
  const reservation = data.reservation!;
  const mappedDates = data.dates;

  if (isAdmin) {
    return (
      <>
        <DataTable columns={adminColumns} data={mappedDates} />
        <div className='float-right'>
          <AddDateDialog id={reservation.id} />
        </div>
      </>
    );
  } else {
    return <DataTable columns={columns} data={mappedDates} />;
  }
}
