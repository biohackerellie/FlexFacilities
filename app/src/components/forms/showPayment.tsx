// @ts-nocheck
'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { ReservationContext } from '@/app/(inner-app)/reservation/[id]/_components/context';
import { GeneratePaymentLink } from '@/functions/other/payments';
import { updateReservation } from '@/lib/actions/reservations';
import { logger } from '@/lib/logger';
import { Button } from '../ui/button';

interface feeProps {
  fees: number;
}

export default function ShowPayment({ fees }: feeProps) {
  const [isLoading, startTransition] = React.useTransition();
  const data = React.use(ReservationContext);
  const facility = data?.facility!;
  const user = data?.user!;
  const reservation = data?.reservation!;
  const email = user?.email || '';

  const description = `${reservation.eventName} at ${facility?.building} ${facility.name} by ${user?.name}`;
  const PayOnline = (id: string, fees: number, email: string) => {
    startTransition(() => {
      toast.promise(GeneratePaymentLink(id, fees, description, email), {
        loading: 'Creating payment link...',
        success: () => {
          return 'success!';
        },
        error: (error) => {
          logger.error('Error creating payment link', { 'error ': error });
          return 'something went wrong';
        },
      });
    });
  };
  const PayinPerson = () => {
    startTransition(() => {
      toast.promise(updateReservation({ ...reservation, paid: true }), {
        loading: 'loading...',
        success: () => {
          return 'success!';
        },
        error: (error) => {
          return error.message;
        },
      });
    });
  };
  return (
    <div className='block gap-x-2 p-2'>
      <Button
        disabled={isLoading}
        variant='outline'
        onClick={() => PayinPerson()}
      >
        Pay in Person
      </Button>

      <Button
        disabled={isLoading}
        variant='outline'
        onClick={() => PayOnline(reservation.id, fees, email)}
      >
        Pay Online
      </Button>
    </div>
  );
}
