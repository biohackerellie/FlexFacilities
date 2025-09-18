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

export type TableReservation = {
  eventName: string;
  Facility: string;
  ReservationDate: string;
  approved: 'pending' | 'approved' | 'denied' | 'canceled';
  User: string;
  Id: bigint;
};

export const columns: ColumnDef<TableReservation>[] = [
  {
    accessorKey: 'eventName',
    header: 'Event Name',
  },
  {
    accessorKey: 'Facility',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Facility
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'ReservationDate',

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Reservation Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'approved',
    header: 'Approve or Deny',
    cell: ({ row }) => {
      const id = row.original.Id;

      return (
        <AlertDialog>
          <AlertDialogTrigger className="hover:text-secondary">
            Approve?
          </AlertDialogTrigger>
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
    accessorKey: 'User',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'Details',
    header: 'Details',
    cell: ({ row }) => {
      const id = parseInt(row.getValue('Details'), 10);
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
