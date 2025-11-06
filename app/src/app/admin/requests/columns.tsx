'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

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
import { ApproveReservation } from '@/lib/actions/reservations';
import type { FullResWithFacilityName } from '@/lib/types';

export const columns: ColumnDef<FullResWithFacilityName>[] = [
  {
    accessorKey: 'eventName',
    header: 'Event Name',
  },
  {
    accessorKey: 'facilityName',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Facility
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    id: 'ReservationDate',
    accessorKey: 'reservationDate',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Reservation Date
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.reservationDate);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: 'approved',
    header: 'Approve or Deny',
    cell: ({ row }) => {
      const id = row.original.reservationId;

      return (
        <AlertDialog>
          <AlertDialogTrigger className='hover:text-secondary'>
            Approve?
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Reservation</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              This action will notify the user of their reservation status.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => ApproveReservation(id, 'approved')}
              >
                Approve
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => ApproveReservation(id, 'denied')}
              >
                Deny
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          User
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'reservationId',
    header: 'Details',
    cell: ({ row }) => {
      const id = row.original.reservationId;
      return (
        <Button asChild>
          <Link prefetch={false} href={`/reservation/${id}`}>
            Details
          </Link>
        </Button>
      );
    },
  },
];
