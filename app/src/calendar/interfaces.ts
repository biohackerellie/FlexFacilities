import type { TEventColor } from '@/calendar/types';
import type { Building } from '@/lib/types';

export interface IEvent {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
  description: string;
  building: Building;
  location: string;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
