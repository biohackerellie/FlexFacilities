import { cookies } from 'next/headers';
import { DataTable } from '@/components/ui/tables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logger } from '@/lib/logger';
import { unauthenticatedClient as client } from '@/lib/rpc';
import { columns } from './columns';

async function getReservations(session: string, token: string) {
  'use cache';
  const { data, error } = await client
    .reservations()
    .allSortedReservations(
      {},
      { headers: { 'X-Session': session, Authorization: `Bearer ${token}` } },
    );
  if (error) {
    logger.error('Failed to get reservations', { error });
    return null;
  }
  return data;
}

async function getCookies() {
  const cookieStore = await cookies();
  let session;
  let token;
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes('flexauth_token')) {
      token = cookie.value;
      continue;
    }
    if (cookie.name.includes('session')) {
      session = cookie.value;
    }
  }
  return { session, token };
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
