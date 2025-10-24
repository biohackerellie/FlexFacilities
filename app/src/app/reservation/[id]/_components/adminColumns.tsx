'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ApproveReservation,
  DeleteDates,
  UpdateDateStatus,
} from '@/lib/actions/reservations';
import { getErrorMessage } from '@/lib/errors';
import type { ReservationDate, ReservationStatus } from '@/lib/types';

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
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
  },
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
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          End Date
          <ArrowUpDown className='ml-2 h-4 w-4' />
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
    header: ({ table }) => {
      const totalRows = table.getRowCount();
      const selectedRows = table.getSelectedRowModel();
      const selectedData = selectedRows.flatRows.map((row) => row.original);
      const SelectedRowIds = selectedData.map((row) => row.id);
      const reservationID =
        table.getRowModel().rows[0]?.original.reservationId ?? '';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>Edit Selected</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() =>
                handleUpdate(
                  SelectedRowIds,
                  'approved',
                  totalRows,
                  reservationID,
                )
              }
            >
              Approve Selected
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleUpdate(SelectedRowIds, 'denied', totalRows, reservationID)
              }
            >
              Deny Selected
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleDelete(SelectedRowIds)}>
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const handleUpdate = (
  ids: string[],
  status: ReservationStatus,
  totalRows: number,
  reservationID: string,
) => {
  if (ids.length === totalRows) {
    toast.promise(ApproveReservation(reservationID, status), {
      loading: 'Updating Reservation Status...',
      success: 'Success',
      error: (error) => {
        return getErrorMessage(error);
      },
    });
  } else {
    toast.promise(UpdateDateStatus(ids, status), {
      loading: 'Updating selected dates...',
      success: 'Success',
      error: (error) => {
        return getErrorMessage(error);
      },
    });
  }
};

const handleDelete = (ids: string[]) => {
  toast.promise(DeleteDates(ids), {
    loading: 'Deleting selected Dates...',
    success: 'Success',
    error: (error) => {
      return getErrorMessage(error);
    },
  });
};
