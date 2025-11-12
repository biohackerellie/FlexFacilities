import { DataTable } from '@/components/ui/tables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
import { columns } from './columns';

async function getReservations(session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.reservations().allSortedReservations({});
  if (error) {
    logger.error('Failed to get reservations', { error });
    return null;
  }
  return data;
}

export default async function Reservations() {
  const { session, token } = await getCookies();
  if (!session || !token) {
    return <div>Please login</div>;
  }

  const data = await getReservations(session, token);
  const Reservations = data?.future ?? [];
  const PastReservations = data?.past ?? [];
  return (
    <div className='space-y-7'>
      <div>
        <h1 className='text-lg font-medium'>Reservations</h1>
      </div>

      <Tabs defaultValue='upcoming'>
        <TabsList>
          <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
          <TabsTrigger value='past'>Past</TabsTrigger>
        </TabsList>
        <TabsContent value='upcoming'>
          <DataTable columns={columns} data={Reservations} />
        </TabsContent>
        <TabsContent value='past'>
          <DataTable columns={columns} data={PastReservations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
