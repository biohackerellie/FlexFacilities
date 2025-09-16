'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/buttons';

interface TableUser {
  Name: string;
  eventName: string;
  Facility?: string;
  ReservationDate?: string;
  approved: 'pending' | 'approved' | 'denied' | 'canceled' | 'N/A';
  Details: number;
}

export const columns: ColumnDef<TableUser>[] = [
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
    header: 'Status',
  },
  {
    accessorKey: 'Details',
    header: 'Details',
    cell: ({ row }) => {
      const id = parseInt(row.getValue('Details'), 10);
      return (
        <Button asChild>
          <Link href={`/reservation/${id}`}>Details</Link>
        </Button>
      );
    },
  },
];
