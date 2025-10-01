import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { MultiStepForm } from '@/components/multi-step-form';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { getFacilities } from '@/lib/actions/facilities';

const Loading = () => {
  return (
    <div>
      <Skeleton className="h-20 w-auto" />
      <Skeleton className="h-96 w-auto" />
      <Skeleton className="h-20 w-auto" />
    </div>
  );
};

export default async function ReservationPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }
  return (
    <section className="my-4 flex flex-col justify-center sm:flex-row">
      <Suspense fallback={<Loading />}>
        <MultiStepForm
          userID={session.userId}
          facilitiesPromise={getFacilities()}
        />
      </Suspense>
    </section>
  );
}
