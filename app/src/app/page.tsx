import { cacheTag } from 'next/cache';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';

type LatLngTuple = [number, number, number?];
interface ICoords {
  latlng: LatLngTuple;
  building: string;
}
interface mapCoords {
  coords: ICoords[];
  center: LatLngTuple;
}

async function getAllMapCoords(): Promise<mapCoords | null> {
  'use cache';
  const { data, error } = await client.facilities().getAllCoords({});
  if (error) return null;
  if (!data) return null;
  const coords = data.data.map((d) => {
    return {
      latlng: [d.latitude, d.longitude],
      building: d.building,
    } as ICoords;
  });

  const center = calculateCenter(coords);
  return { coords, center };
}

function calculateCenter(coords: ICoords[]): LatLngTuple {
  if (coords.length < 2) {
    return [coords[0]?.latlng[0] ?? 0, coords[0]?.latlng[1] ?? 0];
  }
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  let x = 0,
    y = 0,
    z = 0;

  for (const { latlng } of coords) {
    const lat = toRadians(latlng[0]);
    const lng = toRadians(latlng[1]);
    x += Math.cos(lat) * Math.cos(lng);
    y += Math.cos(lat) * Math.sin(lng);
    z += Math.sin(lat);
  }

  const total = coords.length;
  x /= total;
  y /= total;
  z /= total;

  const lng = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp);

  return [toDegrees(lat), toDegrees(lng)];
}

export default async function Home() {
  return (
    <div className=' relative py-10   max-h-dvh  items-center justify-center gap-6 p-6 md:p-10'>
      <React.Suspense fallback={<Skeleton className='h-full w-full' />}>
        <Wrapped />
      </React.Suspense>
    </div>
  );
}

async function fetchBranding() {
  'use cache';
  const { data, error } = await client.utility().getBranding({});
  if (error) {
    logger.error('Error fetching branding', { 'error ': error });
    return undefined;
  }

  cacheTag('branding');
  return data;
}
async function Wrapped() {
  const branding = await fetchBranding();
  const LargeMap = dynamic(() => import('@/components/maps/large'), {
    loading: () => <Spinner />,
    ssr: !!false,
  });
  return (
    <>
      <div className='gap-6 py-10'>
        <h1 className='text-4xl font-bold text-center'>
          Welcome to
          <React.Suspense fallback={''}>
            {branding && <span> {branding.organizationName} </span>}
          </React.Suspense>
          Facility Rentals
        </h1>
      </div>
      <div className='flex justify-evenly'>
        <div className=' h-[32rem] w-1/2 p-2 mx-2 max-w-[100vw] shadow-sm max-h-[100dvh] m-auto inset-0   '>
          <React.Suspense fallback={<Spinner />}>
            <LargeMap promise={getAllMapCoords()} />
          </React.Suspense>
        </div>

        <div className='w-1/2 text-center flex flex-col gap-3 justify-center items-center'>
          <React.Suspense fallback={''}>
            <React.Activity
              mode={branding?.organizationDescription ? 'visible' : 'hidden'}
            >
              <p>{branding?.organizationDescription}</p>
            </React.Activity>
          </React.Suspense>
          <Link href='/facilities' className={buttonVariants({ size: 'lg' })}>
            View Facilities
          </Link>
          <Link href='/reservation' className={buttonVariants({ size: 'lg' })}>
            Reserve now
          </Link>
        </div>
      </div>
    </>
  );
}
