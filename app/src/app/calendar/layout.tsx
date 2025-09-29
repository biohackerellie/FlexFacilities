import * as React from 'react';
import { CalendarProvider } from '@/calendar/contexts/calendar-context';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllCalEvents } from '@/lib/actions/facilities';

export default async function calendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getAllCalEvents();

  return (
    <div className="container relative">
      <div className="sm:hidden">{children}</div>
      <div className="hidden space-y-6 p-10 pb-16 sm:block lg:p-2">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold">Calendar</h1>
        </div>
        <Separator className="my-6" />
        <React.Suspense fallback={<Skeleton className="h-16 w-[650px]" />}>
          <CalendarProvider
            events={data?.events ?? []}
            buildings={data?.buildings ?? []}
          >
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
              <div className="flex-1 lg:max-w-2xl">{children}</div>
            </div>
          </CalendarProvider>
        </React.Suspense>
      </div>
    </div>
  );
}
