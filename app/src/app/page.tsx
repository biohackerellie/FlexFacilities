import dynamic from 'next/dynamic';
import { Spinner } from '@/components/spinner';
import * as React from 'react';
import { getAllMapCoords } from '@/lib/actions/facilities';

export default function Home() {
  const LargeMap = React.useMemo(
    () =>
      dynamic(() => import('@/components/maps/large'), {
        loading: () => <Spinner />,
        ssr: !!false,
      }),
    [],
  );
  return (
    <div className="container-wrapper flex">
      <div className="container h-[50vh] w-[50vw]">
        <LargeMap promise={getAllMapCoords()} />
      </div>
    </div>
  );
}
