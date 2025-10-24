import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DataTable } from '@/components/ui/tables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllBuildingNames } from '@/lib/actions/facilities';
import { getUserNotifications } from '@/lib/actions/users';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { columns } from './columns';
import NotificationList from './notificationList';
import TableSkeleton from './skeleton';

// TODO: cache
async function getReservations(id: string) {
  const { data, error } = await client
    .reservations()
    .userReservations({ userId: id });
  if (error) {
    logger.error(error.message);
  }
  return data?.reservations ?? [];
}

async function getUser(id: string) {
  const { data, error } = await client.users().getUser({ id });
  if (error) {
    logger.error(error.message);
  }
  return data;
}

export default async function accountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) return notFound();
  const reservations = await getReservations(id);
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
              getNotificationsPromise={getUserNotifications(id)}
              getBuildingsPromise={getAllBuildingNames()}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
