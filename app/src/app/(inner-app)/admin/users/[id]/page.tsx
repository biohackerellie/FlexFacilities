import { cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DataTable } from '@/components/ui/tables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllBuildingNames } from '@/lib/actions/facilities';
import { getUser, getUserNotifications } from '@/lib/actions/users';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
import { columns } from './columns';
import NotificationList from './notificationList';
import TableSkeleton from './skeleton';

async function getReservations(id: string, session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed
    .reservations()
    .userReservations({ userId: id });
  if (error) {
    logger.error(error.message);
  }
  cacheTag('reservations', id);
  return data?.reservations ?? [];
}

export default async function accountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, token } = await getCookies();
  if (!session || !token) {
    return notFound();
  }
  const user = await getUser(id, session, token);
  if (!user) return notFound();
  const reservations = await getReservations(id, session, token);
  return (
    <div className='space-x-2 space-y-7'>
      <h1 className='m-3 flex justify-center border-b p-3 text-4xl font-bold drop-shadow-lg'>
        {user.name}
      </h1>
      <h2 className='text-3xl font-bold text-primary shadow-secondary drop-shadow-sm dark:text-secondary'>
        Reservations
      </h2>
      <Tabs defaultValue='reservations'>
        <TabsList>
          <TabsTrigger value='reservations'>Reservations</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value='reservations'>
          {reservations.length === 0 ? (
            <p className='text-center'>No reservations found.</p>
          ) : (
            <Suspense fallback={<TableSkeleton />}>
              <DataTable columns={columns} data={reservations} />
            </Suspense>
          )}
        </TabsContent>
        <TabsContent value='notifications'>
          <Suspense fallback={<TableSkeleton />}>
            <NotificationList
              userId={id}
              getNotificationsPromise={getUserNotifications(id, session, token)}
              getBuildingsPromise={getAllBuildingNames()}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
