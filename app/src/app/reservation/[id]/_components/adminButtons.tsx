import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { Separator } from '@/components/ui/separator';
import { getFacilities } from '@/lib/actions/facilities';
import ReservationOptions from './options';

export default function AdminPanel() {
  return (
    <div className="text-md flex h-5 items-center space-x-4">
      <Separator orientation="vertical" />
      <div>
        <React.Suspense fallback={<Spinner />}>
          <ReservationOptions facilitiesPromise={getFacilities()} />
        </React.Suspense>
      </div>
    </div>
  );
}
