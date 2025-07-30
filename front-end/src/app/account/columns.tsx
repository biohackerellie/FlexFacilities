"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/buttons";

interface TableReservations {
  eventName: string;
  Facility: string;
  ReservationDate: string | undefined;
  approved: "pending" | "approved" | "denied" | "canceled";
  id: number;
}

export const columns: ColumnDef<TableReservations>[] = [
  {
    accessorKey: "eventName",
    header: "Event Name",
  },
  {
    accessorKey: "Facility",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Facility
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "ReservationDate",

    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reservation Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "approved",
    header: "Status",
  },
  {
    accessorKey: "id",
    header: "Details",
    cell: ({ row }) => {
      const id = row.original.id;

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
