import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import type { CategoryType, FacilityType } from "@local/db/schema";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FacilityWithCategory extends FacilityType {
  Category: CategoryType[];
}
type PartialFacility = Partial<FacilityWithCategory>;

export default function FacilityCard({
  name,
  address,
  building,
  imagePath,
  id,
}: PartialFacility) {
  const idString = id?.toString()!;
  return (
    <Card className="relative h-[280px] w-[300px] border-gray-100 bg-zinc-100 shadow-sm drop-shadow-md backdrop-blur-md hover:cursor-pointer hover:border-black dark:bg-zinc-800 dark:text-white dark:shadow-gold sm:h-[380px] sm:w-[400px]">
      <Link href={`/facilities/${idString}`}>
        <CardHeader className="drop-shadow-md">
          <Suspense
            fallback={
              <Skeleton className="aspect-video h-[260px] w-[350px] flex-shrink object-scale-down drop-shadow-md" />
            }
          >
            {imagePath ? (
              <Image
                src={imagePath}
                alt={`${name}`}
                width={350}
                height={260}
                className="aspect-video flex-shrink object-scale-down drop-shadow-md"
              />
            ) : (
              <Image
                src="/logo.jpg"
                alt={`${name}`}
                width={350}
                height={260}
                sizes="(max-width: 480px) (max-height: 350px)"
                className="aspect-video flex-shrink object-scale-down drop-shadow-md"
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
