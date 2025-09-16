'use client';
import * as React from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { updateReservation } from '@/lib/actions/reservations';
import { Reservation } from '@/lib/types';

export default function Paid({ reservation }: { reservation: Reservation }) {
  const [isSubmitting, startTransition] = React.useTransition();
  function onClick() {
    startTransition(() => {
      toast.promise(updateReservation({ ...reservation, paid: true }), {
        loading: 'Updating',
        success: 'Success',
        error: (error) => `Error: ${error.message}`,
        position: 'top-center',
      });
    });
  }
  return (
    <div className="my-2 flex justify-end border-b-2 border-b-gray-700 p-2 text-justify text-xl dark:border-b-white">
      <span className="text-red-500">Not Paid</span>
      <Button
        onClick={() => onClick()}
        className="ml-2"
        disabled={isSubmitting}
      >
        {isSubmitting && <Spinner />}Mark as Paid
      </Button>
    </div>
  );
}
