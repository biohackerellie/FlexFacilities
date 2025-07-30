"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import type { RouterOutputs } from "@local/api";

import FacilityCard from "./facility_card";

export default function CardLayout(props: {
  facilities: Promise<RouterOutputs["facility"]["all"]>;
}) {
  const facilities = React.use(props.facilities);
  const searchParams = useSearchParams();
  let selectedBuilding: string | null = "All";
  if (searchParams && searchParams.has("building")) {
    selectedBuilding = searchParams.get("building");
  }

  if (selectedBuilding !== "All") {
    const filteredFacilities = facilities.filter(
      (facility) => facility.building === selectedBuilding,
    );

    return (
      <>
        <div className="mt-0 flex flex-col gap-4 p-0 pb-[1px] sm:grid sm:grid-cols-2 sm:pb-[150px]">
          {filteredFacilities?.map((facility) => (
            <div key={facility.id} className="show m-2 flex-1 gap-3">
              <FacilityCard {...facility} />
            </div>
          ))}
        </div>
      </>
    );
  } else if (selectedBuilding === "All" || null) {
    return (
      <>
        <div className="mt-0 flex flex-col gap-4 p-0 pb-[1px] sm:grid sm:grid-cols-2 sm:pb-[150px]">
          {facilities?.map((facility) => (
            <div key={facility.id} className="show m-2 flex-1 gap-3">
              <FacilityCard {...facility} />
            </div>
          ))}
        </div>
      </>
    );
  }
}
