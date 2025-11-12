import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import shimmer from '@/components/shimmer';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Building, FacilityWithCategories } from '@/lib/types';
import { toBase64 } from '@/lib/utils';

export default function FacilityCard(
  facility: FacilityWithCategories,
  building?: Building,
) {
  const idString = facility.facility?.id?.toString() ?? '';
  if (!facility.facility) return null;

  return (
    <Card className='relative h-[280px] w-auto hover:cursor-pointer hover:border-blue-400  sm:h-auto sm:w-auto'>
      <Link href={`/facilities/${idString}`}>
        <CardHeader className='drop-shadow-md'>
          <Suspense
            fallback={
              <Skeleton className='aspect-video h-[260px] w-[350px] shrink object-scale-down drop-shadow-md' />
            }
          >
            <AspectRatio ratio={4 / 3}>
              {facility.facility?.imagePath ? (
                <Image
                  src={`/api/files${facility.facility?.imagePath}`}
                  alt={`${facility.facility?.name}`}
                  fill
                  className='rounded-md object-cover h-full w-full'
                  placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                  blurDataURL='data:image/png'
                  sizes='(max-width: 480px) 100vw, 33vw'
                  loading='lazy'
                />
              ) : (
                <Image
                  src='/logo.png'
                  alt={`${facility.facility?.name}`}
                  sizes='(max-width: 480px) (max-height: 350px)'
                  fill
                  className='rounded-md object-cover grayscale opacity-20 dark:opacity-50  dark:brightness-[0.2] h-full w-full'
                />
              )}
            </AspectRatio>
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
