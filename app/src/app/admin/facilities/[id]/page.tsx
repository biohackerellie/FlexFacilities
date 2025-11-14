import { cacheTag } from 'next/cache';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Suspense } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';

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
  logger.debug('building', { building: facility?.building });
  return facility;
}

export default async function facilityEditForm({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const Forms = dynamic(() => import('./forms'));
  const { id } = await params;
  const data = await getFacility(id);
  if (!data) {
    return <div>Facility Not Found</div>;
  }
  const facility = data.facility;
  const imagePath = facility?.imagePath;
  const name = facility?.name;

  return (
    <div className='gap-y-4 space-y-7'>
      <div>
        <h1 className='text-lg font-medium'>
          Edit {data?.building?.name} {facility?.name}
        </h1>
      </div>
      <div className='flex flex-col justify-center'>
        <Suspense fallback={<Skeleton className='h-[400px] w-[400px]' />}>
          <AspectRatio ratio={4 / 3}>
            {imagePath ? (
              <Image
                src={`/api/files${imagePath}`}
                alt={name ?? 'facility image'}
                fill
                sizes='(max-width: 400px)(max-height: 400px) 100vw, 33vw'
                className='border-2 shadow-md drop-shadow-md'
              />
            ) : (
              <Image
                src='/logo.png'
                alt={name ?? 'facility image'}
                fill
                sizes='(max-width: 400px)(max-height: 400px) 100vw, 33vw'
                className='border-2 drop-shadow-xl'
              />
            )}
          </AspectRatio>
        </Suspense>
        <Suspense fallback={<Skeleton className='h-[400px] w-[400px]' />}>
          <Forms data={data} />
        </Suspense>
      </div>
    </div>
  );
}
