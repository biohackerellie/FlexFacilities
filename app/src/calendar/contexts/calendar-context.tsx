'use client';

import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';
import type { IEvent } from '@/calendar/interfaces';
import type { Building } from '@/lib/types';

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedBuildingId: Building['id'] | 'all';
  setSelectedBuildingId: (buildingId: Building['id'] | 'all') => void;
  buildings: Building[];
  events: IEvent[] | null;
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
}
interface TVisibleHours {
  from: number;
  to: number;
}

const CalendarContext = createContext({} as ICalendarContext);
const VISIBLE_HOURS = { from: 5, to: 22 };
export function CalendarProvider({
  children,
  buildings,
  events,
}: {
  children: React.ReactNode;
  buildings: Building[];
  events: IEvent[];
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBuildingId, setSelectedBuildingId] = useState<
    Building['id'] | 'all'
  >('all');

  const [visibleHours, setVisibleHours] =
    useState<TVisibleHours>(VISIBLE_HOURS);

  // This localEvents doesn't need to exists in a real scenario.
  // It's used here just to simulate the update of the events.
  // In a real scenario, the events would be updated in the backend
  // and the request that fetches the events should be refetched
  const [localEvents, setLocalEvents] = useState<IEvent[]>(events);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };
  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate: handleSelectDate,
        selectedBuildingId,
        setSelectedBuildingId,
        buildings,
        // If you go to the refetch approach, you can remove the localEvents and pass the events directly
        events: localEvents,
        setLocalEvents,
        visibleHours,
        setVisibleHours,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error('useCalendar must be used within a CalendarProvider.');
  return context;
}
