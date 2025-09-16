import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server';

export default async function facilityEditForm({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const Forms = dynamic(() => import('./forms'));
  const data = await api.facility.byId({ id: parseInt(params.id, 10) });
  if (!data) return notFound();
  const { name, address, building, capacity, imagePath } = data;

  const FacilityCategories = data.Category.map((category) => {
    return {
      id: category.id,
      name: category.name,
      price: category.price,
    };
  });

  const id = parseInt(params.id, 10);

  return (
    <div className="gap-y-4 space-y-7">
      <div>
        <h1 className="text-lg font-medium">
          Edit {building} {name}
        </h1>
      </div>
      <div className="flex flex-col justify-center">
        <Suspense fallback={<Skeleton className="h-[400px] w-[400px]" />}>
          <div>
            {imagePath ? (
              <Image
                src={imagePath}
                alt={name}
                width={400}
                height={400}
                className="border-2 shadow-md drop-shadow-md"
              />
            ) : (
              <Image
                src="/logo.jpg"
                alt={name}
                width={480}
                height={480}
                className="border-2 drop-shadow-xl"
              />
            )}
          </div>
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[400px] w-[400px]" />}>
          <Forms
            id={id}
            name={name}
            capacity={capacity ?? 30}
            CategoryIDs={FacilityCategories}
          />
        </Suspense>
      </div>
    </div>
  );
}
