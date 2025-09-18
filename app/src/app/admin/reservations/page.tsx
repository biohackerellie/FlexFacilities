import { DataTable } from '@/components/ui/tables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  mapPastReservations,
  mapReservations,
} from '@/functions/calculations/tableData';
import { columns } from './columns';

async function getReservations() {
  const data = await api.reservation.all();
  const [ReservationsData, PastReservationsData] = await Promise.all([
    mapReservations(data),
    mapPastReservations(data),
  ]);

  return { ReservationsData, PastReservationsData };
}

export default async function Reservations() {
  const { ReservationsData, PastReservationsData } = await getReservations();
  const Reservations = ReservationsData ?? [];
  const PastReservations = PastReservationsData ?? [];
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
