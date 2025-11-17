import { Inter, JetBrains_Mono } from 'next/font/google';
import { PublicEnvScript } from 'next-runtime-env';
import * as React from 'react';
import { ThemeProviders } from '@/components/contexts/providers/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import './styles/globals.css';
import { Toaster } from 'sonner';
import Footer from '@/components/ui/footer';
import NavbarWrapper from '@/components/ui/navbar/wrapper';

export { meta as metadata } from './metadata';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

//layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body
        className={cn(
          'min-h-screen font-sans antialiased',
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <ThemeProviders attribute='class' defaultTheme='system' enableSystem>
          <main className='min-h-[95vh]'>
            <div className='z-10'>
              <React.Suspense fallback={<Skeleton className='h-4 w-full' />}>
                <NavbarWrapper />
              </React.Suspense>
            </div>
            <div className='container py-8'>{children}</div>
            <Toaster />
          </main>

          <div className='relative  align-bottom bottom-0 w-full'>
            <React.Suspense fallback={footerSkeleton()}>
              <Footer />
            </React.Suspense>
          </div>
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
