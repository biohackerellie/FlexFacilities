import { ReloadIcon } from '@radix-ui/react-icons';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { client } from '@/lib/rpc';

async function getData(id: string) {
  //TODO: cache
  const { data, error } = await client
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
  const data = await getData(session.userId);
  if (!data) {
    return <div>loading ...</div>;
  }
  // const mappedData = data.reservations.map((r) => {
  //   return {
  //     eventName: r.reservation?.eventName ?? 'N/A',
  //     Facility: 'N/A',
  //     ReservationDate:
  //       r.dates.find((d) => new Date(d.localStart) >= new Date())?.localStart ??
  //       'N/A',
  //     approved: r.reservation?.approved ?? 'N/A',
  //     id: r.reservation?.id ?? 'N/A',
  //   };
  // });
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-lg font-medium">My Reservations</h3>
      </div>
      <Separator />

      <Suspense fallback={<LoadingComponent />}>
        {/* <DataTable columns={columns} data={mappedData} /> */}
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
