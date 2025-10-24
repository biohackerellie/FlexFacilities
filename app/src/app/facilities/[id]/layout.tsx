import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
export default function facilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className='relative'>
      <div className='flex h-full flex-col items-center justify-between p-3'>
        <React.Suspense fallback={<Skeleton className='h-full w-full' />}>
          {children}
        </React.Suspense>
      </div>
    </section>
  );
}
