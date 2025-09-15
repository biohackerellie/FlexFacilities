import * as React from 'react';
import LoadingScreen from '@/components/ui/loadingScreen';
import CardLayout from './cardLayout';
import { client } from '@/lib/rpc';

import { Separator } from '@/components/ui/separator';
import { SidebarSearchParamsNav } from '@/components/ui/sidebar-searchParams';
import { notFound } from 'next/navigation';
import { logger } from '@/lib/logger';

async function getData() {
  'use cache';
  const { data, error } = await client.facilities().getAllFacilities({});
  if (error) {
    logger.error(error.message);
    return null;
  }
  return data;
}

export default async function FacilitiesPage() {
  const data = await getData();
  if (!data) return notFound();
  const buildingSideBar = data.buildings.map(
    (building) => building.building?.name ?? 'all',
  );
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
                <CardLayout buildings={data.buildings} />
              </React.Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
