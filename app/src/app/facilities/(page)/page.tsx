import React, { Suspense } from "react";

import LoadingScreen from "@/components/ui/loadingScreen";
import { api } from "@/trpc/server";
import CardLayout from "./cardLayout";

export default function FacilitiesPage() {
  const facilities = api.facility.all();

  return (
    <div className="space-y-7">
      <Suspense fallback={<LoadingScreen />}>
        <CardLayout facilities={facilities} />
      </Suspense>
    </div>
  );
}
