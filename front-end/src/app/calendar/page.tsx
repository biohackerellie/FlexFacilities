import React, { Suspense } from "react";

import CalendarMain from "@/components/calendar/Calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { GetAllEvents } from "@/functions/events/googleAPI";

export default function Page() {
  return (
    <div className="space-y-7">
      <Suspense fallback={<LoadingScreen />}>
        <CalendarMain promise={GetAllEvents()} />
      </Suspense>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Skeleton className="h-96 w-96" />
    </div>
  );
}
