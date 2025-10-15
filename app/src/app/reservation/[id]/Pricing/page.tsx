import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import EditPricing from '@/components/forms/paymentModal';
import { Spinner } from '@/components/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/tables/reservations/data-table';
import { getFacilities } from '@/lib/actions/facilities';
import {
  costReducer,
  getReservation,
  getReservationCategory,
} from '@/lib/actions/reservations';
import { auth } from '@/lib/auth';
import Options from '../_components/options';
import Paid from '../_components/paid';
import { adminColumns } from './adminColumns';
import { columns } from './columns';

export default async function paymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    return notFound();
  }
  const isAdmin = session.userRole === 'ADMIN';
  const { id } = await params;
  const data = await getReservation(id);
  if (!data) return notFound();
  const reservation = data.reservation!;
  const category = await getReservationCategory(String(reservation.categoryId));

  const CategoryPrice = category?.price;
  const mappedFees = data.fees
    ? data.fees.map((fee) => {
        return {
          additionalFees: parseFloat(fee.additionalFees) ?? 0.0,
          feesType: fee.feesType ?? '',
          options: fee.id,
        };
      })
    : [];

  let totalCost = 0.0;
  const tcData = await costReducer(id);
  if (tcData) {
    totalCost = parseFloat(tcData.cost);
  }

  return (
    <div className="my-3 mb-2 flex h-full w-auto flex-col justify-center gap-y-4 pb-3 sm:flex-row lg:w-[1000px]">
      <div className="m-3 gap-y-4 p-4 drop-shadow-md">
        <h2 className="gap-y-4 text-xl font-bold text-gray-600 dark:text-gray-300">
          Pricing and Payments
        </h2>
        <h3 className="mt-1 font-bold text-gray-600 dark:text-gray-300">
          Added Fees:
        </h3>
        <div className="sm:container sm:w-[600px]">
          <Suspense
            fallback={<Skeleton className="h-[600px] w-[600px]"></Skeleton>}
          >
            {isAdmin ? (
              <>
                <div className="mb-2 border-b py-2">
                  <DataTable columns={adminColumns} data={mappedFees} />
                  <EditPricing id={id} />
                </div>
                <div className="flex justify-center border-b-2">
                  <Options facilitiesPromise={getFacilities()} />
                </div>
              </>
            ) : (
              <div className="border-b">
                <DataTable columns={columns} data={mappedFees} />
              </div>
            )}
          </Suspense>
          <div className="my-2 flex justify-end border-b p-2 text-justify text-xl">
            <div>
              <Suspense fallback={<Spinner />}>
                {!reservation.paid && !reservation.costOverride && (
                  <>
                    <div className="text-sm font-thin text-muted-foreground">
                      Cost Per Hour: ${CategoryPrice} * Total Hours + any
                      additional fees = <br />
                    </div>
                    <div className="float-right">Total: ${totalCost}</div>
                  </>
                )}{' '}
              </Suspense>
              <Suspense fallback={<Spinner />}>
                {!reservation.paid && reservation.costOverride && (
                  <>Total: ${reservation.costOverride}</>
                )}
                {reservation.paid && <>Total: reservation.Paid!</>}
              </Suspense>
            </div>
          </div>

          <div className="flex justify-end text-justify text-xl">
            <Suspense fallback={<Spinner />}>
              {!reservation.paid &&
                (totalCost > 0 ||
                  (reservation.costOverride &&
                    parseFloat(reservation.costOverride) > 0)) && (
                  <>
                    {isAdmin ? (
                      <Paid reservation={reservation} />
                    ) : (
                      <>
                        {/* <ShowPayment */}
                        {/*   fees={ */}
                        {/*     reservation.costOverride */}
                        {/*       ? parseFloat(reservation.costOverride) */}
                        {/*       : totalCost */}
                        {/*   } */}
                        {/* /> */}
                      </>
                    )}
                  </>
                )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
