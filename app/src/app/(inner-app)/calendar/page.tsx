import { cacheTag } from 'next/cache';
import * as React from 'react';
import { ClientContainer } from '@/calendar/components/client-container';
import { CalendarProvider } from '@/calendar/contexts/calendar-context';
import type { IEvent } from '@/calendar/interfaces';
import type { TCalendarView, TEventColor } from '@/calendar/types';
import LoadingScreen from '@/components/ui/loadingScreen';
import { Separator } from '@/components/ui/separator';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import type { Building } from '@/lib/types';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const view = ((await searchParams).view as TCalendarView) || 'month';

  return (
    <div className=' '>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold'>Calendar</h1>

        <Separator className='' />
      </div>
      <React.Suspense fallback={<LoadingScreen />}>
        <Wrapped view={view} />
      </React.Suspense>
    </div>
  );
}

async function Wrapped({ view }: { view: TCalendarView }) {
  const data = await getAllCalEvents();
  return (
    <CalendarProvider
      events={data?.events ?? []}
      buildings={data?.buildings ?? []}
    >
      <div className='mx-auto flex flex-col gap-4 px-8 py-4'>
        <div className='space-y-7'>
          <ClientContainer view={view} />
        </div>
      </div>
    </CalendarProvider>
  );
}

type ReturnType = {
  events: IEvent[];
  buildings: Building[];
};
export async function getAllCalEvents(): Promise<ReturnType | null> {
  'use cache';
  const { data, error } = await client.facilities().getAllEvents({});
  if (error) {
    logger.error('error fetching events', { error: error.message });
    return null;
  }
  if (!data) return null;
  const result: ReturnType = {
    events: [],
    buildings: [],
  };
  const possibleColors: TEventColor[] = [
    'red',
    'yellow',
    'green',
    'blue',
    'purple',
    'orange',
    'gray',
  ];
  let color = possibleColors[0];
  data.data.forEach((event, i) => {
    const events = event.events.map((e, x) => {
      logger.debug('event', e);
      return {
        id: x,
        startDate: e.start,
        endDate: e.end,
        title: e.title,
        color: color,
        description: e.description,
        building: event.building,
        location: e.location,
      } as IEvent;
    });
    result.events.push(...events);
    result.buildings.push(event.building!);

    color = possibleColors[i + 1];
    if (color === undefined) {
      color = possibleColors[0];
    }
  });
  cacheTag('calEvents');
  return result;
}
