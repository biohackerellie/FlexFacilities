import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import BrandingSection from './_components/Home';

export default function Home() {
  return (
    <div className=' relative py-10   max-h-dvh  items-center justify-center gap-6 p-6 md:p-10'>
      <React.Suspense fallback={<Skeleton className='h-full w-full' />}>
        <BrandingSection />
      </React.Suspense>
    </div>
  );
}
