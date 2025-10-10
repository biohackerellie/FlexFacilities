import { ClientContainer } from '@/calendar/components/client-container';
import { TCalendarView } from '@/calendar/types';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const view = ((await searchParams).view as TCalendarView) || 'month';
  return (
    <div className="space-y-7">
      <React.Suspense fallback={<Skeleton className="h-16 w-[650px]" />}>
        <ClientContainer view={view} />
      </React.Suspense>
    </div>
  );
}
