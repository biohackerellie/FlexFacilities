"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@local/db/client";
import { Reservation } from "@local/db/schema";

export default async function Paid(formdata: FormData) {
  const id = formdata.get("id") as unknown as number;
  try {
    await db
      .update(Reservation)
      .set({
        paid: true,
      })
      .where(eq(Reservation.id, id));
    return revalidateTag("reservations");
  } catch (error) {
    throw new Error();
  }
}
