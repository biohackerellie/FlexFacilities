import { ClientContainer } from '@/calendar/components/client-container';
import { TCalendarView } from '@/calendar/types';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const view = ((await searchParams).view as TCalendarView) || 'month';
  return (
    <div className="space-y-7">
      <ClientContainer view={view} />
    </div>
  );
}
