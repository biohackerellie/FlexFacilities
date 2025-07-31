"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { FacilityType as Facility } from "@local/db/schema";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateEmail } from "@/functions/emails";
import {
  approveReservation,
  denyReservation,
  HandleDelete,
} from "@/functions/reservations";

interface ResNavProps {
  id: number | bigint;
  facility: Facility | undefined;
}

export default function ReservationOptions({ id, facility }: ResNavProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendEmail = async () => {
    try {
      await updateEmail(id as number);
      alert("Email sent");
    } catch (error) {
      alert("Email failed to send");
    }
  };

  const approveAll = async (id: number | bigint) => {
    setIsSubmitting(true);
    try {
      await approveReservation(id as number);
      toast("Reservation Approved");
    } catch (error) {
      toast("Something went wrong");
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  const denyAll = async (id: number | bigint) => {
    setIsSubmitting(true);
    try {
      await denyReservation(id as number);
      toast("Reservation Denied");
    } catch (error) {
      toast("Something went wrong");
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost">Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            {!isSubmitting ? (
              <AlertDialogTrigger>
                <span>Approve or Deny All</span>
              </AlertDialogTrigger>
            ) : (
              <Button disabled>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Please Wait
              </Button>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              void sendEmail();
            }}
          >
            Send update email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              HandleDelete(id as number);
              router.push("/admin/reservations");
            }}
          >
            Delete Reservation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
              approveAll(id);
            }}
          >
            Approve
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => {
              denyAll(id);
            }}
          >
            Deny
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
