import { unstable_cacheTag as cacheTag } from 'next/cache';
import { DataTable } from '@/components/ui/tables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { client } from '@/lib/rpc';
import { columns } from './columns';

async function getReservations() {
  'use cache';
  const { data, error } = await client.reservations().allSortedReservations({});
  if (error) {
    console.error(error);
    return null;
  }
  cacheTag('reservations');
  return data;
}

export default async function Reservations() {
  const data = await getReservations();
  const Reservations = data?.future ?? [];
  const PastReservations = data?.past ?? [];
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-lg font-medium">Reservations</h1>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <DataTable columns={columns} data={Reservations} />
        </TabsContent>
        <TabsContent value="past">
          <DataTable columns={columns} data={PastReservations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
