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
    <div className='inline-flex '>
      <Button
        asChild
        aria-label='View by day'
        size='icon'
        className='size-8'
        variant={view === 'day' ? 'default' : 'outline'}
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'day')}`);
        }}
      >
        <List strokeWidth={1.8} />
      </Button>

      <Button
        asChild
        aria-label='View by week'
        size='icon'
        className='size-8'
        variant={view === 'week' ? 'default' : 'outline'}
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'week')}`);
        }}
      >
        <Columns strokeWidth={1.8} />
      </Button>

      <Button
        asChild
        aria-label='View by month'
        size='icon'
        className='size-8'
        variant={view === 'month' ? 'default' : 'outline'}
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'month')}`);
        }}
      >
        <Grid2x2 strokeWidth={1.8} />
      </Button>

      <Button
        asChild
        aria-label='View by year'
        size='icon'
        className='size-8'
        variant={view === 'year' ? 'default' : 'outline'}
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'year')}`);
        }}
      >
        <Grid3x3 strokeWidth={1.8} />
      </Button>

      <Button
        asChild
        aria-label='View by agenda'
        size='icon'
        className='size-8'
        variant={view === 'agenda' ? 'default' : 'outline'}
        onClick={() => {
          router.push(`${pathname}?${createQueryString('view', 'agenda')}`);
        }}
      >
        <CalendarRange strokeWidth={1.8} />
      </Button>
    </div>
  );
}
