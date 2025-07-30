import SuperJSON from "superjson";

import { db } from "@local/db/client";

export async function GET() {
  const data = await db.query.Facility.findMany();
  return SuperJSON.stringify(data);
}
