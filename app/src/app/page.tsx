import dynamic from 'next/dynamic';
import * as React from 'react';
import { Spinner } from '@/components/spinner';
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
    <div className=" relative py-10  max-h-dvh  items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex justify-evenly">
        <div className=" h-[32rem] w-1/2 p-2 mx-2 max-w-[100vw] shadow-sm max-h-[100dvh] m-auto inset-0   ">
          <React.Suspense fallback={<Spinner />}>
            <LargeMap promise={getAllMapCoords()} />
          </React.Suspense>
        </div>

        <div className="w-1/2 text-center flex flex-col justify-center items-center">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            vehicula ipsum risus, et iaculis ipsum malesuada a. Praesent
            consectetur id nulla et pretium. Pellentesque auctor luctus ligula
            sit amet ullamcorper. In sem tortor, malesuada at venenatis sit
            amet, consectetur sit amet eros. In congue sodales ligula, id varius
            mi pretium at. Pellentesque eu faucibus quam. Sed at lacus ex. Fusce
            auctor est turpis, nec auctor sapien faucibus sit amet.{' '}
          </p>
        </div>
      </div>
    </div>
  );
}
