import type { ReservationDate } from '@/lib/types';
export default function range(date: ReservationDate[]): string {
  let dateRange = '';
  if (date.length > 1) {
    dateRange = `${date[0]?.startDate} - ${date[date.length - 1]?.endDate}`;
  } else if (date.length === 1) {
    dateRange = `${date[0]?.startDate}`;
  } else {
    dateRange = 'No Upcoming Dates';
  }

  return dateRange;
}
