import { Elements } from '@stripe/react-stripe-js';
import Link from 'next/link';
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
import { getCookies } from '@/lib/setHeader';
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
  const { session: sessionId, token } = await getCookies();
  if (!sessionId || !token) {
    return notFound();
  }
  const isAdmin = session.userRole === 'ADMIN';
  const { id } = await params;
  const data = await getReservation(id, sessionId, token);
  if (!data) return notFound();
  const reservation = data.reservation;
  if (!reservation) return notFound();
  const category = await getReservationCategory(
    String(reservation.categoryId),
    sessionId,
    token,
  );

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
  const tcData = await costReducer(id, sessionId, token);
  if (tcData) {
    totalCost = Number(tcData.cost);
  }

  return (
    <div className='gap-2 flex  flex-col '>
      <div className='m-3 gap-y-4 p-4 drop-shadow-md'>
        <h2 className='gap-y-4 text-xl font-bold text-gray-600 dark:text-gray-300'>
          Pricing and Payments
        </h2>
        <h3 className='mt-1 font-bold text-gray-600 dark:text-gray-300'>
          Added Fees:
        </h3>
        <div className=''>
          <Suspense
            fallback={<Skeleton className='h-[600px] w-[600px]'></Skeleton>}
          >
            {isAdmin ? (
              <>
                <div className=' relative py-2'>
                  <EditPricing
                    id={id}
                    className=' right-0 top-0 z-5 block absolute  align-top justify-end'
                  />
                  <DataTable columns={adminColumns} data={mappedFees} />
                </div>
                <div className='flex justify-center '>
                  <Options facilitiesPromise={getFacilities()} />
                </div>
              </>
            ) : (
              <div className='border-b'>
                <DataTable columns={columns} data={mappedFees} />
              </div>
            )}
          </Suspense>
          <div className='my-2 flex justify-end border-b p-2 text-justify text-xl'>
            <div>
              <Suspense fallback={<Spinner />}>
                {!reservation.paid && !reservation.costOverride && (
                  <>
                    <div className='text-sm font-thin text-muted-foreground'>
                      Cost Per Hour: ${CategoryPrice} * Total Hours + any
                      additional fees = <br />
                    </div>
                    <div className='float-right'>Total: ${totalCost}</div>
                  </>
                )}{' '}
              </Suspense>
              <Suspense fallback={<Spinner />}>
                {!reservation.paid && reservation.costOverride && (
                  <>Total: ${reservation.costOverride}</>
                )}
                {reservation.paid && 'Total: reservation.Paid!'}
              </Suspense>
            </div>
          </div>

          <div className='flex justify-end text-justify text-xl'>
            <Suspense fallback={<Spinner />}>
              {/*   {/*   <Paid reservation={reservation} /> */}
              <Link
                href={{
                  pathname: '/reservation/Checkout',
                  query: { reservationId: id },
                }}
              >
                Pay Now
              </Link>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
