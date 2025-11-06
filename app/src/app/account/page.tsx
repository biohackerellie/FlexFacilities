import { ReloadIcon } from '@radix-ui/react-icons';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/tables/reservations/data-table';
import { auth } from '@/lib/auth';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
import { columns } from './columns';

async function getData(id: string, session: string, token: string) {
  'use server';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed
    .reservations()
    .userReservations({ userId: id });

  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export default async function Account() {
  const session = await auth();
  if (!session) return notFound();
  const { session: sessionid, token } = await getCookies();
  const data = await getData(session.userId, sessionid, token);
  if (!data) {
    return <div>loading ...</div>;
  }
  return (
    <div className='space-y-7'>
      <div>
        <h3 className='text-lg font-medium'>My Reservations</h3>
      </div>
      <Separator />

      <Suspense fallback={<LoadingComponent />}>
        <DataTable columns={columns} data={data.reservations} />
      </Suspense>
    </div>
  );
}

const LoadingComponent = () => {
  return (
    <div>
      Loading <ReloadIcon className='animate-spin h-4 w-4' />
    </div>
  );
};
