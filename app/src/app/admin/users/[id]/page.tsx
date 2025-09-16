import type {
  FacilityType,
  ReservationDateType,
  ReservationType,
} from '@local/db/schema';
import moment from 'moment';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { DataTable } from '@/components/ui/tables';
import { api } from '@/trpc/server';
import { columns } from './columns';
import TableSkeleton from './skeleton';

interface TableUser {
  Name: string;

  eventName: string;
  Facility: string;
  ReservationDate?: string;
  approved: 'pending' | 'approved' | 'denied' | 'canceled' | 'N/A';
  Details: number;
}

interface Reservation extends ReservationType {
  ReservationDate: ReservationDateType[];
  Facility: FacilityType;
}

const currentDate = moment().format('YYYY-MM-DD');

async function getData(id: string) {
  const user = await api.user.ById({ id: id });
  console.log(user);
  const reservation: Reservation[] = user?.Reservation || [];
  let mappedReservations: TableUser[] = [];
  if (reservation.length === 0) {
    mappedReservations = [
      {
        Name: user?.name ?? 'N/A',
        eventName: 'N/A',
        Facility: 'N/A',
        ReservationDate: 'N/A',
        approved: 'N/A',
        Details: 0,
      },
    ];
  } else {
    mappedReservations = reservation.map((reservation) => {
      const sortedDates = reservation.ReservationDate.sort((a, b) =>
        moment(a.startDate).diff(moment(b.startDate)),
      );
      const nextUpcomingDate = sortedDates.find((date) =>
        moment(date.startDate).isSameOrAfter(currentDate),
      );
      return {
        Name: user?.name ?? 'N/A',
        eventName: reservation.eventName,
        Facility: reservation.Facility.name,
        ReservationDate: nextUpcomingDate ? nextUpcomingDate.startDate : 'N/A',
        approved: reservation.approved,
        Details: reservation.id,
      };
    });
  }
  return mappedReservations;
}

export default async function accountPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  const data = await getData(id);
  if (!data) return notFound();
  const name = data[0]?.Name;
  return (
    <div className="space-x-2 space-y-7">
      <h1 className="m-3 flex justify-center border-b p-3 text-4xl font-bold drop-shadow-lg">
        {name}
      </h1>
      <h2 className="text-3xl font-bold text-primary shadow-secondary drop-shadow-sm dark:text-secondary">
        Reservations
      </h2>
      {data.length === 0 ? (
        <p className="text-center">No reservations found.</p>
      ) : (
        <Suspense fallback={<TableSkeleton />}>
          <DataTable columns={columns} data={data} />
        </Suspense>
      )}
    </div>
  );
}
