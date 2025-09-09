import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import moment from 'moment';

import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/ui/loadingScreen';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getFacility, getEventsByFacility } from '@/lib/actions/facilities';

export default async function FacilityPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const fac = await getFacility(params.id);
  const events = await getEventsByFacility(params.id);

  if (!fac) return notFound();
  const facility = fac.facility!;
  const map = `https://www.google.com/maps/search/?api=1&query=${facility.address}`;

  return (
    <TooltipProvider>
      <div className="m-1 mb-10 mt-7 flex h-full w-auto flex-col justify-center gap-2 p-2 sm:m-5 sm:flex-row sm:p-5">
        <div className="flex flex-col">
          <h1 className="text-center text-2xl font-bold drop-shadow-sm sm:text-start sm:text-4xl">
            {facility.name}
          </h1>
          <h2 className="text-md text-center font-bold text-gray-600 drop-shadow-sm dark:text-gray-300 sm:text-start sm:text-xl">
            {facility.building} ⋅ Max Capacity: {facility.capacity}{' '}
          </h2>
          <Link
            href={map}
            target="_blank"
            className="text-center sm:text-start"
          >
            {facility.address}{' '}
            <ExternalLink className="inline-block scale-75" />
          </Link>
          <div className="hidden sm:flex">
            {facility.imagePath ? (
              <Image
                src={facility.imagePath}
                alt={facility.name}
                width={600}
                height={600}
                className="shadow-md drop-shadow-md"
              />
            ) : (
              <Image
                src="/logo.jpg"
                alt={facility.name}
                width={480}
                height={480}
                className="drop-shadow-xl"
              />
            )}
          </div>
          <div className="flex justify-center sm:hidden">
            {facility.imagePath ? (
              <Image
                src={facility.imagePath}
                alt={facility.name}
                width={300}
                height={300}
                className="shadow-md drop-shadow-md"
              />
            ) : (
              <Image
                src="/logo.jpg"
                alt={facility.name}
                width={240}
                height={240}
                className="drop-shadow-xl"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 p-4">
          <Button asChild className="text-xl font-bold drop-shadow-lg">
            <Link
              href={{
                pathname: '/reservation',
                query: {
                  id: facility.id,
                },
              }}
            >
              {' '}
              Request a rental{' '}
            </Link>
          </Button>

          <div className="my-3 mr-4 max-w-sm items-end justify-center border-4 p-4 sm:max-w-md sm:justify-between">
            <h1 className="border-b-2 text-2xl font-bold">Pricing</h1>
            {fac.categories.map((category) => (
              <div key={category.id} className="grid grid-cols-3 p-4">
                <Tooltip>
                  <TooltipTrigger className="col-span-2 col-start-1 truncate text-left text-lg font-semibold">
                    {category.name}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="flex w-[240px] flex-wrap">
                      {category.description}
                    </p>
                  </TooltipContent>
                </Tooltip>
                {facility.name === 'Laurel Stadium' ? (
                  <p className="left-9 right-0 col-start-3 items-end justify-around justify-items-end self-end text-right align-bottom text-lg font-semibold">
                    ${category.price}
                  </p>
                ) : (
                  <p className="left-9 right-0 col-start-3 items-end justify-around justify-items-end self-end text-right align-bottom text-lg font-semibold">
                    ${category.price} / hr
                  </p>
                )}
              </div>
            ))}
          </div>
          <Suspense fallback={<LoadingScreen />}>
            <ScrollArea className="h-[400px] w-[340px] rounded-md border p-4 sm:h-[400px] sm:w-[480px]">
              <h1 className="border-b-2 text-2xl font-bold">Upcoming Events</h1>
              {events &&
                [...events.events]
                  .sort(
                    (a, b) =>
                      new Date(a.start!).getTime() -
                      new Date(b.start!).getTime(),
                  )
                  .map((event) => (
                    <div key={event.title}>
                      <div className="grid grid-cols-2 border-b p-4">
                        <h3 className="col-start-1">{event.title}</h3>
                        <p className="bg-transparent text-sm">
                          {moment(event.start).format(
                            'ddd, MMM Do YYYY,  h:mm a',
                          )}{' '}
                          {' to '} {moment(event.end).format('h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
            </ScrollArea>
          </Suspense>
        </div>
      </div>
    </TooltipProvider>
  );
}
