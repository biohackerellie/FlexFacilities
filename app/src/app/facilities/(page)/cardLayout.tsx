'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import FacilityCard from './facility_card';
import type {
  BuildingWithFacilities,
  FacilityWithCategories,
} from '@/lib/types';

export default function CardLayout(props: {
  buildings: BuildingWithFacilities[];
}) {
  const { buildings } = props;
  let facilities: FacilityWithCategories[];
  const searchParams = useSearchParams();
  let selectedBuilding: string | null = 'All';

  if (searchParams && searchParams.has('building')) {
    selectedBuilding = searchParams.get('building');
  }

  if (selectedBuilding !== 'All') {
    facilities =
      buildings.find((building) => building.building?.name === selectedBuilding)
        ?.facilities || [];
    return (
      <>
        <div className="mt-0 flex flex-col gap-4 p-0 pb-px sm:grid sm:grid-cols-2 sm:pb-[150px]">
          {facilities.length &&
            facilities.map((facility) => (
              <div
                key={facility.facility?.id}
                className="show m-2 flex-1 gap-3"
              >
                <FacilityCard {...facility} />
              </div>
            ))}
        </div>
      </>
    );
  } else if (selectedBuilding === 'All' || null) {
    facilities = buildings.flatMap((building) => building.facilities);
    return (
      <>
        <div className="mt-0 flex flex-col gap-4 p-0 pb-px sm:grid sm:grid-cols-2 sm:pb-[150px]">
          {facilities?.map((facility) => (
            <div key={facility.facility?.id} className="show m-2 flex-1 gap-3">
              <FacilityCard {...facility} />
            </div>
          ))}
        </div>
      </>
    );
  }
}
