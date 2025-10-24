import { notFound } from 'next/navigation';

import {
  getReservation,
  getReservationCategory,
} from '@/lib/actions/reservations';
import { getUser } from '@/lib/actions/users';

export default async function reservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getReservation(id);
  if (!data || !data.reservation) return notFound();

  const reservation = data.reservation;
  const { name, phone, details } = reservation;
  const user = await getUser(reservation.userId);
  const category = await getReservationCategory(String(reservation.categoryId));

  return (
    <div className='space-y-7'>
      <div>
        <h2 className='text-2xl text-muted-foreground'> Summary </h2>
      </div>
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
        <div className='flex flex-row border-b-2 text-justify text-lg sm:justify-between'>
          Requested Category:{' '}
          <div className='text max-w-sm truncate text-ellipsis'>
            {category?.name}
          </div>
        </div>
        <div className='my-10 flex flex-row flex-wrap justify-between gap-10 text-ellipsis border-b-2 text-justify text-xl'>
          Description:{' '}
          <div className='text-md ml-10 flex text-ellipsis text-left'>
            {details}{' '}
          </div>
        </div>
      </div>
    </div>
  );
}
