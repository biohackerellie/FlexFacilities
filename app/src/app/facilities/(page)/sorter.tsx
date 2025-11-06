"use client";

import { notFound, useSearchParams } from "next/navigation";
import * as React from "react";
import type { getFacilities } from "@/lib/actions/facilities";
import type { FacilityWithCategories } from "@/lib/types";
import FacilityCard from "./facility_card";

export function Sorter({
  dataPromise,
}: {
  dataPromise: Promise<Awaited<ReturnType<typeof getFacilities>>>;
}) {
  const data = React.use(dataPromise);
  const searchParams = useSearchParams();
  const buildingQuery = searchParams.get("building");
  if (!data) return notFound();

  let selectedBuilding = "All";

  if (buildingQuery) {
    selectedBuilding = buildingQuery;
  }
  const buildings = data.buildings;

  let facilities: FacilityWithCategories[];

  if (selectedBuilding !== "All") {
    facilities =
      buildings.find((building) => building.building?.name === selectedBuilding)
        ?.facilities || [];
  } else {
    facilities = buildings.flatMap((building) => building.facilities);
  }

  return (
    <div className="mt-0 flex flex-col gap-4 p-0 pb-px sm:grid sm:grid-cols-3 sm:pb-[150px] overflow-y-scroll">
      {facilities?.map((facility, i) => (
        <div key={i} className="show m-2 flex-1 gap-3">
          <FacilityCard
            {...facility}
            {...buildings.find(
              (building) => building.building?.name === selectedBuilding,
            )}
          />
        </div>
      ))}
    </div>
  );
}
