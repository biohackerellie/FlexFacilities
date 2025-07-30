import * as React from "react";
import { notFound } from "next/navigation";

import SmallCalendar from "@/components/calendar/smallCalendar";
import { GetEvents } from "@/functions/events/googleAPI";
import { api } from "@/trpc/server";

export default async function calPage({ params }: { params: { id: string } }) {
  const reservation = await api.reservation.byId({ id: parseInt(params.id) });
  if (!reservation) return notFound();
  const facilityId = reservation.Facility.id;
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-lg font-medium">
          {reservation.Facility.name}Calendar
        </h3>
      </div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <SmallCalendar promise={GetEvents(facilityId)} />
      </React.Suspense>
    </div>
  );
}
