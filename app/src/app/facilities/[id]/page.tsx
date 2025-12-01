import { ExternalLink } from 'lucide-react';
import { cacheTag } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import shimmer from '@/components/shimmer';
import { Spinner } from '@/components/spinner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/ui/loadingScreen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { toBase64 } from '@/lib/utils';

async function getFacility(id: string) {
  'use cache: private';
  const { data: facility, error } = await client
    .facilities()
    .getFacility({ id: id });

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  cacheTag(`facility-${id}`);
  cacheTag('facilities');
  return facility;
}

async function getEventsByFacility(id: string) {
  'use cache: private';

  cacheTag(`events-${id}`);
  const { data: events, error } = await client
    .facilities()
    .getEventsByFacility({ id: id });
  if (error) {
    logger.error('Error fetching facility events', { 'error ': error });
    return null;
  }
  return events;
}

export default async function FacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fac = await getFacility(id);
  const events = await getEventsByFacility(id);

  if (!fac || !fac.facility) {
    return (
      <div className='container-wrapper'>
        <div className='container'>Something went wrong</div>
      </div>
    );
  }
  const facility = fac.facility;
  const map = `https://www.google.com/maps/search/?api=1&query=${fac.building?.address}`;

  return (
    <div className='container-wrapper'>
      <div className='container'>
        <React.Suspense fallback={<Spinner />}>
          <div className=' sm:flex sm:justify-between'>
            <div>
              <h1 className='text-center text-2xl font-bold drop-shadow-sm sm:text-start sm:text-4xl'>
                {facility.name}
              </h1>
              <h2 className='text-md text-center font-bold text-gray-600 drop-shadow-sm dark:text-gray-300 sm:text-start sm:text-xl'>
                {fac.building?.name} ⋅ Max Capacity: {facility.capacity}{' '}
              </h2>
              <Link
                href={map}
                target='_blank'
                className='text-center sm:text-start'
              >
                {fac.building?.address}{' '}
                <ExternalLink className='inline-block scale-75' />
              </Link>
            </div>
          </div>
        </React.Suspense>
        <Separator />
        <TooltipProvider>
          <div className='m-1 flex flex-col gap-x-8 justify-center gap-2 p-2 sm:m-5 sm:grid sm:grid-cols-3 '>
            <React.Suspense fallback={<Spinner />}>
              <div className='hidden sm:block col-span-2'>
                <AspectRatio ratio={16 / 9}>
                  {facility.imagePath ? (
                    <Image
                      src={`/api/files${facility.imagePath}`}
                      alt={facility.name}
                      fill
                      className='rounded-md object-cover h-full w-full'
                      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                      blurDataURL='data:image/png'
                      sizes='(max-width: 1280px) 100vw, 33vw'
                      loading='lazy'
                    />
                  ) : (
                    <Image
                      src='/logo.png'
                      alt={facility.name}
                      fill
                      className='drop-shadow-xl rounded-md object-cover h-full w-full border opacity-20 grayscale'
                      sizes='(max-width: 1280px) 100vw, 33vw'
                    />
                  )}
                </AspectRatio>
              </div>
              <div className='flex justify-center sm:hidden'>
                <AspectRatio ratio={4 / 3}>
                  {facility.imagePath ? (
                    <Image
                      src={`/api/files${facility.imagePath}`}
                      alt={facility.name}
                      fill
                      className='rounded-md object-cover h-full w-full'
                      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                      blurDataURL='data:image/png'
                      sizes='(max-width: 1280px) 100vw, 33vw'
                      loading='lazy'
                    />
                  ) : (
                    <Image
                      src='/logo.png'
                      alt={facility.name}
                      fill
                      className='drop-shadow-xl rounded-md object-cover h-full w-full border opacity-20 grayscale'
                      sizes='(max-width: 1280px) 100vw, 33vw'
                    />
                  )}
                </AspectRatio>
              </div>
              <div className='flex flex-col gap-4 justify-center items-center'>
                <div className='relative  items-end align-bottom bottom-0'>
                  <Button asChild className='text-xl font-bold drop-shadow-lg'>
                    <Link
                      href={{
                        pathname: '/reservation',
                        query: {
                          id: facility.id,
                        },
                      }}
                    >
                      {' '}
                      Request a rental{' '}
                    </Link>
                  </Button>
                </div>
                <div className=' block self-end  max-w-md items-end justify-end right-0 ml-4  border-4 p-4 '>
                  <div>
                    <h1 className='border-b-2 text-2xl font-bold'>Pricing</h1>
                    {fac.pricing.map((category) => (
                      <div key={category.id} className='grid grid-cols-3 p-4'>
                        <Tooltip>
                          <TooltipTrigger className='col-span-2 col-start-1 truncate text-left text-lg font-semibold'>
                            {category.categoryName}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='flex w-[240px] flex-wrap'>
                              {category.categoryDescription}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <p className='col-span-1 col-start-3 text-right text-lg font-semibold'>
                          ${category.price}/{category.unitLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </React.Suspense>

            <div className='col-span-3 rounded-md border p-4'>
              <h1 className='border-b-2 text-2xl font-bold'>Upcoming Events</h1>
              <React.Suspense fallback={<LoadingScreen />}>
                <React.Activity mode={events ? 'visible' : 'hidden'}>
                  <ScrollArea className='max-h-[30vh] min-h-[25vh] overflow-y-scroll w-full  '>
                    {events &&
                      [...events.events]
                        .sort(
                          (a, b) =>
                            new Date(a.start).getTime() -
                            new Date(b.start).getTime(),
                        )
                        .map((event) => (
                          <div key={event.start}>
                            <div className='grid grid-cols-2 border-b p-4'>
                              <h3 className='col-start-1'>{event.title}</h3>
                              <p className='bg-transparent text-sm'>
                                {new Date(event.start).toLocaleString()} to{' '}
                                {new Date(event.end).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                  </ScrollArea>
                </React.Activity>
              </React.Suspense>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
