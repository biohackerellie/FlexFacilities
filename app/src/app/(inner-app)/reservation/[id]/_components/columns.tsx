'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ReservationDate } from '@/lib/types';

export const columns: ColumnDef<ReservationDate>[] = [
  {
    accessorKey: 'localStart',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Start Date
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('localStart') as string);
      return <div>{format(date, 'yyyy-MM-dd')}</div>;
    },
  },
  {
    accessorKey: 'localEnd',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          End Date
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('localEnd') as string);
      return <div>{format(date, 'yyyy-MM-dd')}</div>;
    },
  },
  {
    header: 'Start Time',
    cell: ({ row }) => {
      const date = new Date(row.getValue('localStart') as string);
      return <div>{format(date, 'HH:mm:ss')}</div>;
    },
  },
  {
    header: 'End Time',
    cell: ({ row }) => {
      const date = new Date(row.getValue('localEnd') as string);
      return <div>{format(date, 'HH:mm:ss')}</div>;
    },
  },
  {
    accessorKey: 'approved',
    header: 'Status',
  },
];
