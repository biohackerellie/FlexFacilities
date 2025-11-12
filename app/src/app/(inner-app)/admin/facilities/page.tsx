import { cacheTag } from 'next/cache';
import { Suspense } from 'react';
import { DataTable } from '@/components/ui/tables';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
import TableSkeleton from '../requests/skeleton';
import { columns, type TableFacility } from './columns';

async function getFacilities(session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.facilities().getAllFacilities({});
  if (error) {
    logger.error('error fetching facilities', { error: error });
    return [] as TableFacility[];
  }
  if (!data) {
    return [] as TableFacility[];
  }
  const facilities: TableFacility[] = [];
  const facData = data.buildings;
  for (const building of facData) {
    for (const f of building.facilities) {
      if (!f.facility) {
        continue;
      }
      const facility = {
        id: f.facility.id,
        name: f.facility.name,
        building: building.building?.name,
        address: building.building?.address,
        imagePath: f.facility.imagePath,
        capacity: f.facility.capacity!,
        googleCalendarId: f.facility.googleCalendarId,
        Category: f.categories.map((c) => c.id),
      } as TableFacility;
      facilities.push(facility);
    }
  }
  cacheTag('facilities');
  return facilities;
}

export default async function adminFacilitiesPage() {
  const { session, token } = await getCookies();
  if (!session || !token) {
    return null;
  }
  const data = await getFacilities(session, token);

  return (
    <div className='space-y-7'>
      <div>
        <h1 className='text-lg font-medium'>Facilities</h1>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <DataTable columns={columns} data={data} />
      </Suspense>
    </div>
  );
}
