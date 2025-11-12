'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ApproveReservation,
  DeleteReservation,
} from '@/lib/actions/reservations';
import { ReservationContext } from './context';

export default function ReservationOptions() {
  const router = useRouter();
  const reservation = React.useContext(ReservationContext);
  const id = reservation?.reservation.id!;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const approveAll = async (id: string) => {
    setIsSubmitting(true);
    try {
      await ApproveReservation(id, 'approved');
      toast('Reservation Approved');
    } catch (_error) {
      toast('Something went wrong');
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  const denyAll = async (id: string) => {
    setIsSubmitting(true);
    try {
      await ApproveReservation(id, 'denied');
      toast('Reservation Denied');
    } catch (_error) {
      toast('Something went wrong');
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant='ghost'>Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem asChild>
            {!isSubmitting ? (
              <AlertDialogTrigger>
                <span>Approve or Deny All</span>
              </AlertDialogTrigger>
            ) : (
              <Button disabled>
                <Loader2 className='animate-spin mr-2 h-4 w-4' />
                Please Wait
              </Button>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem */}
          {/*   onClick={() => { */}
          {/*     void sendEmail(); */}
          {/*   }} */}
          {/* > */}
          {/*   Send update email */}
          {/* </DropdownMenuItem> */}
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            onClick={() => {
              DeleteReservation(id);
              router.push('/admin/reservations');
            }}
          >
            Delete Reservation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve All</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          This action will notify the user of their reservation status.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              approveAll(id);
            }}
          >
            Approve
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => {
              denyAll(id);
            }}
          >
            Deny
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
