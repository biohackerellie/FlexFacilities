import type { Metadata, ResolvingMetadata } from 'next';
import * as React from 'react';
import Footer from '@/components/ui/footer';
import NavbarWrapper from '@/components/ui/navbar/wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { getBranding } from '@/lib/actions/utility';
export async function generateMetadata(
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const branding = await getBranding();
  const previous = await parent;
  return {
    title: branding?.organizationName
      ? `${branding?.organizationName} Facility Rentals`
      : previous.title,
    description: branding?.organizationDescription ?? previous.description,
    openGraph: {
      title: branding?.organizationName
        ? `${branding?.organizationName} Facility Rentals`
        : previous.openGraph?.title,
      description:
        branding?.organizationDescription ?? previous.openGraph?.description,
    },
  };
}
export default function InnerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <div className='z-10'>
        <React.Suspense fallback={<Skeleton className='h-4 w-full' />}>
          <NavbarWrapper />
        </React.Suspense>
      </div>
      <div className='container py-8'>{children}</div>
      <div className='fixed  align-bottom bottom-0 w-full'>
        <React.Suspense fallback={footerSkeleton()}>
          <Footer />
        </React.Suspense>
      </div>
      <Toaster />
    </main>
  );
}
function footerSkeleton() {
  return (
    <footer className='bg-secondary/90 bottom-0 left-0 right-0 mt-5 hidden max-h-10 w-full flex-row items-center justify-around border-t border-t-gray-300 bg-opacity-90 p-2 text-secondary-foreground backdrop-blur-md sm:flex'>
      <Skeleton className='h-4 w-full' />
    </footer>
  );
}
