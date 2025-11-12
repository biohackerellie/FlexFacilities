import * as React from 'react';
import LoadingScreen from '@/components/ui/loadingScreen';
import { Separator } from '@/components/ui/separator';
import { SidebarSearchParamsNav } from '@/components/ui/sidebar-searchParams';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import FacilityCard from './facility_card';

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { building } = params;
  return (
    <div className='container relative'>
      <div className=' space-y-6 p-2 pb-16 sm:block'>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold'>Facilities</h1>
        </div>
        <Separator className='my-6' />
        <React.Suspense fallback={<LoadingScreen />}>
          <FacilityCards building={building} />
        </React.Suspense>
      </div>
    </div>
  );
}

async function FacilityCards({ building }: { building?: string }) {
  const { facilities, buildings } = await getData(building);
  let selectedBuilding = 'All';

  const buildingSideBar = buildings?.map(
    (building) => building.building?.name ?? 'all',
  );
  if (building) {
    selectedBuilding = building;
  }
  return (
    <div className='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
      <aside className='-mx-4 lg:w-1/5'>
        <React.Suspense fallback={<div>Loading...</div>}>
          <SidebarSearchParamsNav items={buildingSideBar ?? []} />
        </React.Suspense>
      </aside>
      <div className='flex-1  overflow-y-scroll max-h-[80vh]'>
        <div className='space-y-7'>
          <div className='mt-0 flex flex-col gap-4 p-0 pb-px sm:grid sm:grid-cols-3 sm:pb-[150px] overflow-y-scroll'>
            {facilities?.map((facility, i) => (
              <div key={i} className='show m-2 flex-1 gap-3'>
                <FacilityCard
                  {...facility}
                  {...buildings.find(
                    (building) => building.building?.name === selectedBuilding,
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function getData(building?: string) {
  'use cache: private';
  const { data, error } = await client.facilities().getAllFacilities({});
  if (error) {
    logger.error(error.message);
    return { facilities: null, buildings: null };
  }
  if (!data) return { facilities: null, buildings: null };
  if (building && building !== 'All') {
    return {
      facilities:
        data.buildings.find((b) => b.building?.name === building)?.facilities ||
        [],
      buildings: data.buildings,
    };
  }
  return {
    facilities: data.buildings.flatMap((b) => b.facilities),
    buildings: data.buildings,
  };
}
