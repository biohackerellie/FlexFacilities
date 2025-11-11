import { Inter, JetBrains_Mono } from 'next/font/google';
import * as React from 'react';

import { ThemeProviders } from '@/components/contexts/providers/ThemeProvider';
import Footer from '@/components/ui/footer';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

import './styles/globals.css';
import { Skeleton } from '@/components/ui/skeleton';

export { meta as metadata } from './metadata';

import NavbarWrapper from '@/components/ui/navbar/wrapper';

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
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body
        className={cn(
          'h-screen font-sans antialiased',
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <ThemeProviders attribute='class' defaultTheme='system' enableSystem>
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
        </ThemeProviders>
      </body>
    </html>
  );
}

function footerSkeleton() {
  return (
    <footer className='bg-secondary/90 bottom-0 left-0 right-0 mt-5 hidden max-h-10 w-full flex-row items-center justify-around border-t border-t-gray-300 bg-opacity-90 p-2 text-secondary-foreground backdrop-blur-md sm:flex'>
      <Skeleton className='h-4 w-full' />
    </footer>
  );
}
