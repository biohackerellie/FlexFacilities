import * as React from 'react';
import { auth } from '@/lib/auth';
import { Skeleton } from '../skeleton';
import NavMenu from './Menu';

const NavbarSkeleton = () => {
  return (
    <section className='p-2 mb-2  border-b'>
      <Skeleton className='h-8 w-full' />
    </section>
  );
};

export default async function NavbarWrapper() {
  const session = await auth();
  return (
    <React.Suspense fallback={<NavbarSkeleton />}>
      <NavMenu session={session} />
    </React.Suspense>
  );
}
