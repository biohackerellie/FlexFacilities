"use server";

import { eq, sql } from "drizzle-orm";

import { db } from "@local/db/client";
import { Reservation } from "@local/db/schema";

export default async function PiP(id: any) {
  try {
    await db
      .update(Reservation)
      .set({
        inPerson: true,
      })
      .where(eq(Reservation.id, id));
  } catch (error) {
    throw new Error();
  }
  return Response.json(({ response: 200, body: "success" }.response = 200));
}
