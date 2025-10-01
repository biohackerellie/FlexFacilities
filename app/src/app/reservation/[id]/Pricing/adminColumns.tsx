'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TableFees {
  additionalFees: number;
  feesType: string;
  options: any;
}

const HandleDelete = async (id: number) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    alert('Error deleting fee');
  }
};

export const adminColumns: ColumnDef<TableFees>[] = [
  {
    accessorKey: 'additionalFees',

    header: 'Cost',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('additionalFees'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'feesType',
    header: 'Fee Type',
  },
  {
    accessorKey: 'options',
    header: 'options',
    cell: ({ row }) => {
      //eslint-disable-next-line
      const feeID = row.getValue('options') as number;

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Options</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => HandleDelete(feeID)}>
                Delete Fee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
