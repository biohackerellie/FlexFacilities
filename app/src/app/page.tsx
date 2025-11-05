import dynamic from 'next/dynamic';
import Link from 'next/link';
import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { buttonVariants } from '@/components/ui/button';
import { getAllMapCoords } from '@/lib/actions/facilities';
import { getBranding } from '@/lib/actions/utility';

export default async function Home() {
  const branding = await getBranding();

  const LargeMap = dynamic(() => import('@/components/maps/large'), {
    loading: () => <Spinner />,
    ssr: !!false,
  });

  return (
    <div className=' relative py-10   max-h-dvh  items-center justify-center gap-6 p-6 md:p-10'>
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
              mode={
                branding && branding.organizationDescription
                  ? 'visible'
                  : 'hidden'
              }
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
    </div>
  );
}
