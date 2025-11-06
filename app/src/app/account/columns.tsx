'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
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
    accessorKey: 'reservationDate',
    id: 'ReservationDate',
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
      if (Number.isNaN(date.getTime())) {
        return <div>{row.original.reservationDate}</div>;
      }
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
    header: 'Status',
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
