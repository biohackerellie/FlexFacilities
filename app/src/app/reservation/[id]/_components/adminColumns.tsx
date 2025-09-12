'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { format } from 'date-fns';
import EditDates from '@/components/forms/EditDates';
import EditMultipleDates from '@/components/forms/EditMultipleDays';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import HandleDelete from '@/functions/reservations/deleteDates';
import UpdateStatus from '@/functions/reservations/updateStatus';
import { ReservationDate } from '@/lib/types';

export const adminColumns: ColumnDef<ReservationDate>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'localStart',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.localStart);
      return <div>{format(date, 'yyyy-MM-dd')}</div>;
    },
  },
  {
    accessorKey: 'localEnd',
    header: ({ column }) => {
      column.toggleVisibility(false);
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.localEnd);
      return <div>{format(date, 'yyyy-MM-dd')}</div>;
    },
  },
  {
    header: 'Start Time',
    cell: ({ row }) => {
      const date = new Date(row.original.localStart);
      return <div>{format(date, 'HH:mm:ss')}</div>;
    },
  },
  {
    header: 'End Time',
    cell: ({ row }) => {
      const date = new Date(row.original.localEnd);
      return <div>{format(date, 'HH:mm:ss')}</div>;
    },
  },
  {
    accessorKey: 'approved',
    header: 'Status',
  },

  {
    accessorKey: 'id',
    header: 'Options',
    cell: ({ row }) => {
      const dateID = row.original.id;
      const ReservationID = row.original.reservationId;
      const isApproved = row.original.approved;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isApproved && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    UpdateStatus({
                      id: dateID,
                      status: 'approved',
                      reservationID: ReservationID,
                    })
                  }
                >
                  Approve Date
                </DropdownMenuItem>
              </>
            )}
            {isApproved && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    UpdateStatus({
                      id: dateID,
                      status: 'denied',
                      reservationID: ReservationID,
                    })
                  }
                >
                  Deny Date
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuItem
              onClick={() => HandleDelete(dateID, ReservationID)}
            >
              Delete Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

  {
    accessorKey: 'reservationId',
    header: ({ table }) => {
      const selectedRows = table.getSelectedRowModel();
      const selectedData = selectedRows.flatRows.map((row) => row.original);
      const SelectedRowIds = selectedData.map((row) => row.id);
      return (
        <>
          <EditMultipleDates ids={SelectedRowIds} />
        </>
      );
    },
    cell: ({ row }) => {
      const id = row.original.id;
      const startDate = row.original.startDate;
      const endDate = row.original.endDate;
      const startTime = row.original.startTime;
      const endTime = row.original.endTime;
      const reservationID = row.original.reservationId;

      return (
        <EditDates
          date={{
            id: id,
            startDate: startDate,
            endDate: endDate,
            startTime: startTime,
            endTime: endTime,
            resID: reservationID,
          }}
        />
      );
    },
  },
];
