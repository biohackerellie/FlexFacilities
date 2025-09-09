import { Separator } from '@/components/ui/separator';
import ReservationOptions from '@/components/ui/tables/reservations/reservation/options';

export default function AdminPanel() {
  return (
    <div className="text-md flex h-5 items-center space-x-4">
      <Separator orientation="vertical" />
      <div>
        <ReservationOptions />
      </div>
    </div>
  );
}
