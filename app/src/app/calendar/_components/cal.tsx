'use client';
import * as React from 'react';
import { getAllEvents } from '@/lib/actions/facilities';

export default function CalendarPage({
  eventsPromise,
}: {
  eventsPromise: Promise<Awaited<ReturnType<typeof getAllEvents>>>;
}) {
  const data = React.use(eventsPromise);
  const events = data?.events ?? [];
}
