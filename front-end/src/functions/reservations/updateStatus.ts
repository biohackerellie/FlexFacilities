"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@local/db/client";
import { Reservation, ReservationDate } from "@local/db/schema";

import { api } from "@/trpc/server";
import { CreateGoogleEvent } from "../google/singleDate";

interface props {
  id: number;
  status: "approved" | "denied" | "pending";
  reservationID?: number;
}

export default async function UpdateStatus({
  id,
  status,
  reservationID,
}: props) {
  try {
    if (reservationID) {
      const reservation = await api.reservation.byId({
        id: reservationID,
      });

      if (reservation?.approved === "pending" && status === "approved") {
        await db
          .update(Reservation)
          .set({
            approved: status,
          })
          .where(eq(Reservation.id, reservationID));
      }
    }

    await db
      .update(ReservationDate)
      .set({
        approved: status,
      })
      .where(eq(ReservationDate.id, id));
  } catch (error) {
    return error;
  }
  if (status === "approved") {
    try {
      await CreateGoogleEvent(id);
    } catch (error) {
      return { message: "failed to update event" };
    }
  }
  return revalidateTag("reservations");
}
