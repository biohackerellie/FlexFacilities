'use client';

import { CalendarRange, Columns, Grid2x2, Grid3x3, List } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';

export default function ViewSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get('view');
  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  return (
    <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
      <Button
        asChild
        aria-label="View by day"
        size="icon"
        variant={view === 'day' ? 'default' : 'outline'}
        className="rounded-r-none [&_svg]:size-5"
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'day')}`);
        }}
      >
        <List strokeWidth={1.8} />
      </Button>

      <Button
        asChild
        aria-label="View by week"
        size="icon"
        variant={view === 'week' ? 'default' : 'outline'}
        className="-ml-px rounded-none [&_svg]:size-5"
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'week')}`);
        }}
      >
        <Columns strokeWidth={1.8} />
      </Button>

      <Button
        asChild
        aria-label="View by month"
        size="icon"
        variant={view === 'month' ? 'default' : 'outline'}
        className="-ml-px rounded-none [&_svg]:size-5"
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'month')}`);
        }}
      >
        <Grid2x2 strokeWidth={1.8} />
      </Button>

      <Button
        asChild
        aria-label="View by year"
        size="icon"
        variant={view === 'year' ? 'default' : 'outline'}
        className="-ml-px rounded-none [&_svg]:size-5"
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'year')}`);
        }}
      >
        <Grid3x3 strokeWidth={1.8} />
      </Button>

      <Button
        asChild
        aria-label="View by agenda"
        size="icon"
        variant={view === 'agenda' ? 'default' : 'outline'}
        className="-ml-px rounded-l-none [&_svg]:size-5"
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'agenda')}`);
        }}
      >
        <CalendarRange strokeWidth={1.8} />
      </Button>
    </div>
  );
}
