import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { getFacility } from '@/lib/actions/facilities';

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
  if (!data) return notFound();
  const facility = data?.facility;
  if (!facility) return notFound();
  const imagePath = facility?.imagePath;
  const name = facility?.name;

  return (
    <div className='gap-y-4 space-y-7'>
      <div>
        <h1 className='text-lg font-medium'>
          Edit {data.building?.name} {facility?.name}
        </h1>
      </div>
      <div className='flex flex-col justify-center'>
        <Suspense fallback={<Skeleton className='h-[400px] w-[400px]' />}>
          <div>
            {imagePath ? (
              <Image
                src={`/api/files/images/${imagePath}`}
                alt={name!}
                width={400}
                height={400}
                className='border-2 shadow-md drop-shadow-md'
              />
            ) : (
              <Image
                src='/logo.jpg'
                alt={name!}
                width={480}
                height={480}
                className='border-2 drop-shadow-xl'
              />
            )}
          </div>
        </Suspense>
        <Suspense fallback={<Skeleton className='h-[400px] w-[400px]' />}>
          <Forms data={data} />
        </Suspense>
      </div>
    </div>
  );
}
