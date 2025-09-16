import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FacilityWithCategories } from '@/lib/types';

export default function FacilityCard(facility: FacilityWithCategories) {
  const idString = facility.facility?.id?.toString()!;
  if (!facility.facility) return null;
  const { name, building, address, imagePath } = facility.facility;
  return (
    <Card className="relative h-[280px] w-[300px] border-gray-100 bg-zinc-100 shadow-xs drop-shadow-md backdrop-blur-md hover:cursor-pointer hover:border-black dark:bg-zinc-800 dark:text-white dark:shadow-gold sm:h-[380px] sm:w-[400px]">
      <Link href={`/facilities/${idString}`}>
        <CardHeader className="drop-shadow-md">
          <Suspense
            fallback={
              <Skeleton className="aspect-video h-[260px] w-[350px] shrink object-scale-down drop-shadow-md" />
            }
          >
            {imagePath ? (
              <Image
                src={imagePath}
                alt={`${name}`}
                width={350}
                height={260}
                className="aspect-video shrink object-scale-down drop-shadow-md"
              />
            ) : (
              <Image
                src="/logo.jpg"
                alt={`${name}`}
                width={350}
                height={260}
                sizes="(max-width: 480px) (max-height: 350px)"
                className="aspect-video shrink object-scale-down drop-shadow-md"
              />
            )}
          </Suspense>
        </CardHeader>
        <CardContent className="mt-2 space-y-1 text-center">
          <p className="text-lg font-bold leading-none">{name}</p>
          <p className="text-lg font-medium leading-none">{address}</p>
          <p className="text-lg font-medium leading-none">{building}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
