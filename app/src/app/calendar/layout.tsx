import * as React from 'react';
import LoadingScreen from '@/components/ui/loadingScreen';

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='container-wrapper'>
      <div className='container relative'>
        <React.Suspense fallback={<LoadingScreen />}>{children}</React.Suspense>
      </div>
    </div>
  );
}
