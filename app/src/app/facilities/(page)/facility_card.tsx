import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Building, FacilityWithCategories } from '@/lib/types';

export default function FacilityCard(
  facility: FacilityWithCategories,
  building?: Building,
) {
  const idString = facility.facility?.id?.toString()!;
  if (!facility.facility) return null;

  return (
    <Card className='relative h-[280px] w-[300px] border-gray-100 bg-zinc-100 shadow-xs drop-shadow-md backdrop-blur-md hover:cursor-pointer hover:border-black dark:bg-zinc-800 dark:text-white dark:shadow-gold sm:h-[380px] sm:w-[400px]'>
      <Link href={`/facilities/${idString}`}>
        <CardHeader className='drop-shadow-md'>
          <Suspense
            fallback={
              <Skeleton className='aspect-video h-[260px] w-[350px] shrink object-scale-down drop-shadow-md' />
            }
          >
            {facility.facility?.imagePath ? (
              <Image
                src={facility.facility?.imagePath}
                alt={`${facility.facility?.name}`}
                width={350}
                height={260}
                className='aspect-video shrink object-scale-down drop-shadow-md'
              />
            ) : (
              <Image
                src='/logo.jpg'
                alt={`${facility.facility?.name}`}
                width={350}
                height={260}
                sizes='(max-width: 480px) (max-height: 350px)'
                className='aspect-video shrink object-scale-down drop-shadow-md'
              />
            )}
          </Suspense>
        </CardHeader>
        <CardContent className='mt-2 space-y-1 text-center'>
          <p className='text-lg font-bold leading-none'>
            {facility.facility?.name}
          </p>
          <p className='text-lg font-medium leading-none'>
            {building?.address ?? ''}
          </p>
          <p className='text-lg font-medium leading-none'>{building?.name}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
