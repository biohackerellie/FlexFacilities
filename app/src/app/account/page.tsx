import { ReloadIcon } from '@radix-ui/react-icons';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { client } from '@/lib/rpc';
import { columns } from './columns';

async function getData(id: string) {
  'use server';
  const { data, error } = await client
    .reservations()
    .userReservations({ userId: id });

  if (error) {
    console.error(error);
    return null;
  }
  console.log(data);
  return data;
}

export default async function Account() {
  const session = await auth();
  if (!session) return notFound();
  const data = await getData(session.userId);
  if (!data) {
    return <div>loading ...</div>;
  }
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-lg font-medium">My Reservations</h3>
      </div>
      <Separator />

      <Suspense fallback={<LoadingComponent />}>
        <DataTable columns={columns} data={mappedData} />
      </Suspense>
    </div>
  );
}

const LoadingComponent = () => {
  return (
    <div>
      Loading <ReloadIcon className="animate-spin h-4 w-4" />
    </div>
  );
};
