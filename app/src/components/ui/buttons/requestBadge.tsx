"use client";

import * as React from "react";

import type { RouterOutputs } from "@local/api";

import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";

export default function RequestBadge(props: {
  requestCount: Promise<RouterOutputs["reservation"]["requestCount"]>;
}) {
  const initialData = React.use(props.requestCount);

  const { data: requestCount } = api.reservation.requestCount.useQuery(
    undefined,
    { initialData },
  );
  let count = 0;
  if (requestCount.length > 0) {
    count = requestCount[0]?.value!;
  }

  return <Badge className="animate-pulse">{count}</Badge>;
}
