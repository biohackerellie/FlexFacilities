import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { isPaymentComplete } from '@/lib/actions/payments';

export default async function Success({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string }>;
  params: Promise<{ id: string }>;
}) {
  const sessionId = (await searchParams).session_id;
  const reservationId = (await params).id;

  return (
    <div className='flex justify-center items-center'>
      <React.Suspense fallback={<Spinner />}>
        <Suspensed reservationId={reservationId} sessionId={sessionId} />
      </React.Suspense>
    </div>
  );
}

async function Suspensed({
  reservationId,
  sessionId,
}: {
  reservationId: string;
  sessionId: string | undefined;
}) {
  if (!sessionId) {
    return <h1 className='text-red-500'>No session id</h1>;
  }
  const isComplete = await isPaymentComplete(sessionId, reservationId);
  if (!isComplete) {
    return <h1 className='text-red-500'>Payment is not complete</h1>;
  }
  return <h1 className='text-green-500'>Payment is complete</h1>;
}
