"use server";

import { api } from "@/trpc/server";

export async function requestCount() {
  const count = await api.reservation.requestCount();
  return count;
}
