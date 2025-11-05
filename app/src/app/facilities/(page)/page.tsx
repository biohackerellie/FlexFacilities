import { notFound } from 'next/navigation';
import * as React from 'react';
import LoadingScreen from '@/components/ui/loadingScreen';
import { Separator } from '@/components/ui/separator';
import { SidebarSearchParamsNav } from '@/components/ui/sidebar-searchParams';
import { getAllBuildingNames, getFacilities } from '@/lib/actions/facilities';
import FacilityCard from './facility_card';
import { Sorter } from './sorter';

export default async function FacilitiesPage() {
  return (
    <div className='container-wrapper'>
      <div className='container'>
        <div className=' space-y-6 p-2 pb-16 sm:block'>
          <div className='space-y-0.5'>
            <h1 className='text-2xl font-bold'>Facilities</h1>
          </div>
          <Separator className='my-6' />
          <div className='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <aside className='-mx-4 lg:w-1/5'>
              <React.Suspense fallback={<div>Loading...</div>}>
                <SidebarSearchParamsNav namesQuery={getAllBuildingNames()} />
              </React.Suspense>
            </aside>
            <div className='flex-1 lg:max-w-4xl overflow-y-scroll max-h-[80vh]'>
              <div className='space-y-7'>
                <React.Suspense fallback={<LoadingScreen />}>
                  <Sorter dataPromise={getFacilities()} />
                </React.Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
