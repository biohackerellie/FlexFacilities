import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { Separator } from '@/components/ui/separator';
import ReservationOptions from './reservationOptions';

export default async function AdminPanel() {
  return (
    <div className='text-md flex h-5 items-center space-x-4'>
      <Separator orientation='vertical' />
      <div>
        <React.Suspense fallback={<Spinner />}>
          <ReservationOptions />
        </React.Suspense>
      </div>
    </div>
  );
}
