import { notFound } from 'next/navigation';
import * as React from 'react';
import LoadingScreen from '@/components/ui/loadingScreen';
import { Separator } from '@/components/ui/separator';
import { SidebarSearchParamsNav } from '@/components/ui/sidebar-searchParams';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { FacilityWithCategories } from '@/lib/types';
import FacilityCard from './facility_card';

async function getData() {
  // TODO: cache
  const { data, error } = await client.facilities().getAllFacilities({});
  if (error) {
    logger.error(error.message);
    return null;
  }
  return data;
}

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const data = await getData();
  const params = await searchParams;
  const buildingQuery = params.building;
  if (!data) return notFound();
  const buildingSideBar = data.buildings.map(
    (building) => building.building?.name ?? 'all',
  );

  let selectedBuilding = 'All';

  if (params && buildingQuery) {
    selectedBuilding = buildingQuery;
  }
  const buildings = data.buildings;

  let facilities: FacilityWithCategories[];

  if (selectedBuilding !== 'All') {
    facilities =
      buildings.find((building) => building.building?.name === selectedBuilding)
        ?.facilities || [];
  } else {
    facilities = buildings.flatMap((building) => building.facilities);
  }
  return (
    <div className="container relative">
      <div className=" space-y-6 p-2 pb-16 sm:block">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold">Facilities</h1>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <React.Suspense fallback={<div>Loading...</div>}>
              <SidebarSearchParamsNav items={buildingSideBar} />
            </React.Suspense>
          </aside>
          <div className="flex-1 lg:max-w-4xl">
            <div className="space-y-7">
              <React.Suspense fallback={<LoadingScreen />}>
                <div className="mt-0 flex flex-col gap-4 p-0 pb-px sm:grid sm:grid-cols-2 sm:pb-[150px]">
                  {facilities?.map((facility) => (
                    <div
                      key={facility.facility?.id}
                      className="show m-2 flex-1 gap-3"
                    >
                      <FacilityCard
                        {...facility}
                        {...buildings.find(
                          (building) =>
                            building.building?.name === selectedBuilding,
                        )}
                      />
                    </div>
                  ))}
                </div>
              </React.Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
