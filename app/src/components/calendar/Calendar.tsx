// @ts-nocheck
'use client';
import moment from 'moment';
import * as React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import type { BuildingAll } from '@local/validators/constants';
import { buildingCalendars, buildingColors } from '@local/validators/constants';
import { AlertDialogAction } from '@radix-ui/react-alert-dialog';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { getAllEvents } from '@/lib/actions/facilities';
import { CalendarInfo } from '../ui';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';

const localizer = momentLocalizer(moment);

type EventComponentProps = {
  title: string | undefined;
  start: Date;
  end: Date;
  building: any;
} | null;

export default function CalendarMain({
  promise,
}: {
  promise: Promise<Awaited<ReturnType<typeof getAllEvents>>>;
}) {
  const searchParams = useSearchParams();
  const [selectedEvent, setSelectedEvent] =
    React.useState<EventComponentProps>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  let selectedBuilding: string | null = 'All';
  if (searchParams?.has('building')) {
    selectedBuilding = searchParams.get('building');
  }

  const { theme } = useTheme();

  const isDarkMode = theme === 'dark';
  const calendarStyle = {
    height: 600,
    width: 1000,
    justifyContent: '',
    border: 5,
    ...(isDarkMode && {
      WebkitTextFillColor: 'white',
      WebkitTextStrokeColor: 'white',
    }),
  };
  const fetchedEvents = React.use(promise);
  const mappedEvents = fetchedEvents.map((event) => {
    if (!event.location) event.location = 'unknown';
    const facility = event.location.split('-')[0] || 'unknown';
    return {
      //@ts-expect-error - fixing weird gcal typings
      title: event.summary || event.title || 'Event',
      start: new Date(event?.start as unknown as string),
      end: new Date(event?.end as unknown as string),
      building: facility,
    };
  });

  const filteredEvents =
    selectedBuilding === 'All'
      ? mappedEvents
      : mappedEvents.filter(
          (event: Event) => event?.building === selectedBuilding,
        );

  const url = buildingCalendars[selectedBuilding as BuildingAll];

  return (
    <div className="p-[10px]">
      <div className="drop-shadow-md">
        <div className="inline-flex">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button>Open {selectedBuilding} Google Calendar</Button>
          </a>
          <CalendarInfo />
        </div>

        <Calendar
          localizer={localizer}
          events={filteredEvents}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setIsOpen(true);
          }}
          popup
          eventPropGetter={(event) => ({
            style: {
              backgroundColor:
                buildingColors[event.building || 'Administration Building'],
            },
          })}
          startAccessor="start"
          endAccessor="end"
          style={calendarStyle}
        />
      </div>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="mb-4 text-xl font-bold">
            {selectedEvent?.title} <br />
            {selectedEvent?.building}
          </AlertDialogHeader>
          <AlertDialogDescription>
            <p className="mb-2">
              {' '}
              Starts at {selectedEvent?.start.toLocaleString()}
            </p>
            <p className="mb-4">
              {' '}
              Ends at {selectedEvent?.end.toLocaleString()}
            </p>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
