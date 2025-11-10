import * as React from 'react';
import { auth } from '@/lib/auth';
import { client } from '@/lib/rpc';
import { Skeleton } from '../skeleton';
import NavMenu from './Menu';

const NavbarSkeleton = () => {
  return (
    <section className='p-2 mb-2  border-b'>
      <Skeleton className='h-8 w-full' />
    </section>
  );
};

async function getBranding() {
  'use cache';
  const { data, error } = await client.utility().getBranding({});
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export default async function NavbarWrapper() {
  const session = await auth();
  const branding = await getBranding();
  const url = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const logo = {
    url: branding?.organizationUrl ?? url,
    src: branding?.organizationLogoPath ?? '/logo.png',
    alt: branding?.organizationName ?? 'Logo',
    title: branding?.organizationName ?? 'FlexFacilities',
  };

  return (
    <React.Suspense fallback={<NavbarSkeleton />}>
      <NavMenu logo={logo} session={session} />
    </React.Suspense>
  );
}
