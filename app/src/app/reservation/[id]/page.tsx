import { notFound } from 'next/navigation';
import * as React from 'react';
import LoadingScreen from '@/components/ui/loadingScreen';
import {
  getReservation,
  getReservationPricing,
} from '@/lib/actions/reservations';
import { getUser } from '@/lib/actions/users';
import { getCookies } from '@/lib/setHeader';

export default async function reservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className='space-y-7'>
      <div>
        <h2 className='text-2xl text-muted-foreground'> Summary </h2>
      </div>
      <React.Suspense fallback={<LoadingScreen />}>
        <Suspensed id={id} />
      </React.Suspense>
    </div>
  );
}

async function Suspensed({ id }: { id: string }) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    return notFound();
  }
  const data = await getReservation(id, session, token);
  if (!data || !data.reservation) return notFound();

  const reservation = data.reservation;
  const { name, phone, details } = reservation;
  const user = await getUser(reservation.userId, session, token);
  const pricing = await getReservationPricing(id, session, token);

  return (
    <div className='hidden flex-col flex-wrap justify-between sm:flex'>
      <div className='flex flex-row justify-between border-b-2 text-justify text-lg'>
        Primary Contact: <div> {name}</div>
      </div>
      <div className='flex flex-row justify-between border-b-2 text-justify text-lg'>
        Contact Number: <div>{phone}</div>
      </div>
      <div className='flex flex-row justify-between border-b-2 text-justify text-lg'>
        Contact Email: <div>{user?.email ?? ''}</div>
      </div>
      <React.Activity mode={pricing ? 'visible' : 'hidden'}>
        <div className='flex flex-row border-b-2 text-justify text-lg sm:justify-between'>
          Requested Category:{' '}
          <div className='text max-w-sm truncate text-ellipsis'>
            {pricing?.categoryName}
          </div>
        </div>
      </React.Activity>
      <div className='my-10 flex flex-row flex-wrap justify-between gap-10 text-ellipsis border-b-2 text-justify text-xl'>
        Description:{' '}
        <div className='text-md ml-10 flex text-ellipsis text-left'>
          {details}{' '}
        </div>
      </div>
    </div>
  );
}
