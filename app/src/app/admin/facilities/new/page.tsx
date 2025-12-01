import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { getAllBuildingNames, getAllProducts } from '@/lib/actions/facilities';
import { getCookies } from '@/lib/setHeader';
import NewFacilityForm from './form';
export default async function newFacilityForm() {
  const { session, token } = await getCookies();
  return (
    <div className='space-y-7'>
      <div>
        <h1 className='text-lg font-medium'>New Facility</h1>
      </div>
      <React.Suspense fallback={<Spinner />}>
        <NewFacilityForm
          buildingPromise={getAllBuildingNames()}
          productPromise={getAllProducts(session ?? '', token ?? '')}
        />
      </React.Suspense>
    </div>
  );
}
