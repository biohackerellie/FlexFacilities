"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/buttons";
import { approveReservation, denyReservation } from "@/functions/reservations";

type TableReservation = {
  eventName: string;
  Facility: string;
  ReservationDate: string;
  approved: "pending" | "approved" | "denied" | "canceled";
  User: string;
  Details: number;
};

export const columns: ColumnDef<TableReservation>[] = [
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
    header: "Approve or Deny",
    cell: ({ row }) => {
      const id = parseInt(row.getValue("Details"));

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
                onClick={() => {
                  void approveReservation(id);
                }}
              >
                Approve
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => {
                  void denyReservation(id);
                }}
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
    accessorKey: "User",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "Details",
    header: "Details",
    cell: ({ row }) => {
      const id = parseInt(row.getValue("Details"));
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
