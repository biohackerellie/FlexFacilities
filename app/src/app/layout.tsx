import { Inter, JetBrains_Mono } from 'next/font/google';
import * as React from 'react';

import { ThemeProviders } from '@/components/contexts/providers/ThemeProvider';
import Footer from '@/components/ui/footer';
import Navbar from '@/components/ui/navbar/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { getBranding } from '@/lib/actions/utility';

import './styles/globals.css';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthProvider } from '@/components/hooks/useAuth';
export { meta as metadata } from './metadata';

import { Metadata, ResolvingMetadata } from 'next';
import { auth } from '@/lib/auth';

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
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

//layout.tsx
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <AuthProvider session={session}>
        <body
          className={cn(
            'min-h-screen font-sans antialiased',
            fontSans.variable,
            fontMono.variable,
          )}
        >
          <ThemeProviders attribute="class" defaultTheme="system" enableSystem>
            <Navbar />

            {children}
            <div className="absolute bottom-0 w-full">
              <React.Suspense fallback={footerSkeleton()}>
                <Footer />
              </React.Suspense>
            </div>
            <Toaster />
          </ThemeProviders>
        </body>
      </AuthProvider>
    </html>
  );
}

function footerSkeleton() {
  return (
    <footer className="bg-secondary/90 bottom-0 left-0 right-0 mt-5 hidden max-h-10 w-full flex-row items-center justify-around border-t border-t-gray-300 bg-opacity-90 p-2 text-secondary-foreground backdrop-blur-md sm:flex">
      <Skeleton className="h-4 w-full" />
    </footer>
  );
}
