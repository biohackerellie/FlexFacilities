import { notFound } from 'next/navigation';
import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import { getFacility } from '@/lib/actions/facilities';
import { getReservation } from '@/lib/actions/reservations';
import { getUser } from '@/lib/actions/users';
import { auth } from '@/lib/auth';
import type { ReservationDate } from '@/lib/types';
import type { SideBarType } from '@/lib/validators/constants';
import AdminPanel from './_components/adminButtons';
import { ReservationProvider } from './_components/context';

export default async function reservationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    return notFound();
  }
  const isAdmin = session.userRole === 'ADMIN';
  const { id: paramsId } = await params;
  const data = await getReservation(paramsId);
  if (!data) return notFound();
  const reservation = data.reservation;
  if (!reservation) return notFound();
  const { id, eventName } = reservation;
  const fac = await getFacility(String(reservation.facilityId));
  const Facility = fac?.facility!;

  const user = await getUser(reservation.userId);
  const authorized = session.userId === reservation.userId || isAdmin;
  const reservationItems: SideBarType = [
    {
      title: 'Summary',
      href: `/reservation/${id}`,
    },
    {
      title: 'Insurance',
      href: `/reservation/${id}/Insurance`,
    },
    {
      title: 'Pricing & Payments',
      href: `/reservation/${id}/Pricing`,
    },
    {
      title: 'Reservation Dates',
      href: `/reservation/${id}/Dates`,
    },
    {
      title: `${Facility.name} Calendar`,
      href: `/reservation/${id}/Calendar`,
    },
  ];
  if (!authorized) {
    return (
      <div className='flex flex-col flex-wrap justify-center text-center align-middle'>
        <h1 className='text-2xl font-bold'>
          You must be logged in to view this page
        </h1>
      </div>
    );
  }
  const context = {
    reservation: reservation,
    user: user!,
    facility: Facility,
    dates: data.dates,
  };
  return (
    <ReservationProvider reservation={context}>
      <div className='container relative'>
        <div className='sm:hidden'>{children}</div>
        <div className='hidden space-y-6 p-10 pb-16 sm:block'>
          <div className='space-y-0.5'>
            <h1 className='text-2xl font-bold'>{eventName}</h1>
            <h2 className='text-muted-foreground'>
              {fac?.building?.name} {Facility?.name}
            </h2>
            <h3 className='text-muted-foreground'>{range(data.dates)}</h3>
            <React.Suspense fallback={<Spinner />}>
              {isAdmin && (
                <div className='relative float-right self-start p-4 sm:right-0 sm:self-end sm:p-0'>
                  <AdminPanel />
                </div>
              )}
            </React.Suspense>
          </div>
          <Separator className='my-6' />
          <div className='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <aside className='-mx-4 lg:w-1/5'>
              <React.Suspense fallback={<Spinner />}>
                <SidebarNav items={reservationItems} />
              </React.Suspense>
            </aside>
            <div className='flex-1 lg:max-w-4xl'>{children}</div>
          </div>
        </div>
      </div>
    </ReservationProvider>
  );
}

function range(reservationDates: ReservationDate[]): string {
  let dateRange = '';
  if (reservationDates.length > 1) {
    dateRange = `${reservationDates[0]?.localStart} - ${reservationDates[reservationDates.length - 1]?.localEnd}`;
  } else if (reservationDates.length === 1) {
    dateRange = `${reservationDates[0]?.localStart}`;
  } else {
    dateRange = 'no upcoming dates';
  }
  return dateRange;
}
