"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@local/db/client";
import { ReservationDate } from "@local/db/schema";

export default async function HandleDelete(id: number, reservationID: number) {
  try {
    const response = await db
      .delete(ReservationDate)
      .where(eq(ReservationDate.id, id));
  } catch (error) {
    throw new Error();
  }
  return revalidateTag("reservations");
}
