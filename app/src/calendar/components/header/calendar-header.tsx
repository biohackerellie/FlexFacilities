import { BuildingSelect } from '@/calendar/components/header/building-select';
import { DateNavigator } from '@/calendar/components/header/date-navigator';
import { TodayButton } from '@/calendar/components/header/today-button';
import type { IEvent } from '@/calendar/interfaces';
import type { TCalendarView } from '@/calendar/types';
import ViewSelect from './view-select';

interface IProps {
  view: TCalendarView;
  events: IEvent[];
}

export function CalendarHeader({ view, events }: IProps) {
  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} events={events} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <ViewSelect />

          <BuildingSelect />
        </div>
      </div>
    </div>
  );
}
