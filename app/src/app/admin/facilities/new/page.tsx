import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { getAllBuildingNames } from '@/lib/actions/facilities';
import NewFacilityForm from './form';
export default function newFacilityForm() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-lg font-medium">New Facility</h1>
      </div>
      <React.Suspense fallback={<Spinner />}>
        <NewFacilityForm buildingPromise={getAllBuildingNames()} />
      </React.Suspense>
    </div>
  );
}
