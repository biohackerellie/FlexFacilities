import * as React from 'react';
import { notFound } from 'next/navigation';

import type { SideBarType } from '@/lib/validators/constants';

import IsUserReserv from '@/components/contexts/isUserReserv';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import range from '@/functions/calculations/dateRange';
import AdminPanel from './adminButtons';
import { auth } from '@/lib/auth';
import { Spinner } from '@/components/spinner';
import { getReservation } from '@/lib/actions/reservations';
import { getFacility } from '@/lib/actions/facilities';

export default async function reservationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const session = await auth();
  if (!session) {
    return notFound();
  }
  const isAdmin = session.userRole === 'ADMIN';
  const data = await getReservation(params.id);
  if (!data) return notFound();
  const reservation = data.reservation;

  if (!reservation) return notFound();
  const { id, eventName } = reservation;
  const fac = await getFacility(String(reservation.facilityId));
  const Facility = fac?.facility!;
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

  return (
    <IsUserReserv reservation={reservation} session={session}>
      <div className="container relative">
        <div className="sm:hidden">{children}</div>
        <div className="hidden space-y-6 p-10 pb-16 sm:block">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold">{eventName}</h1>
            <h2 className="text-muted-foreground">
              {Facility?.building} {Facility?.name}
            </h2>
            <h3 className="text-muted-foreground">{range(data.dates)}</h3>
            <React.Suspense fallback={<Spinner />}>
              {isAdmin && (
                <div className="relative float-right self-start p-4 sm:right-0 sm:self-end sm:p-0">
                  <AdminPanel id={id} facility={Facility} />
                </div>
              )}
            </React.Suspense>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <React.Suspense fallback={<Spinner />}>
                <SidebarNav items={reservationItems} />
              </React.Suspense>
            </aside>
            <div className="flex-1 lg:max-w-4xl">{children}</div>
          </div>
        </div>
      </div>
    </IsUserReserv>
  );
}
