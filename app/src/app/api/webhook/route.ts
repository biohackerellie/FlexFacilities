import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { and, eq, gte, or, sql } from "drizzle-orm";

import { db } from "@local/db/client";
import { Reservation } from "@local/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const [res] = await db
      .update(Reservation)
      .set({
        paid: true,
      })
      .where(eq(Reservation.paymentLinkID, body.data.object.payment.order_id))
      .returning({ id: Reservation.id });
    if (!res) {
      throw new Error("Reservation not found");
    }
    const resId = res.id;
    revalidateTag("reservations");
    return NextResponse.json({ message: "Reservation updated successfully" });
  } catch (error) {
    console.error("Failed to update reservation: ", error);
    return NextResponse.json(error);
  }
}
