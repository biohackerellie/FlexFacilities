import * as React from 'react';
import { CalendarProvider } from '@/calendar/contexts/calendar-context';
import { Separator } from '@/components/ui/separator';
import { getAllCalEvents } from '@/lib/actions/facilities';

export default async function calendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getAllCalEvents();

  return (
    <div className="container-wrapper ">
      <div className=" container   ">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Calendar</h1>

          <Separator className="" />
        </div>
        <CalendarProvider
          events={data?.events ?? []}
          buildings={data?.buildings ?? []}
        >
          <div className="mx-auto flex flex-col gap-4 px-8 py-4">
            {children}
          </div>
        </CalendarProvider>
      </div>
    </div>
  );
}
