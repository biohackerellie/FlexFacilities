import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';

export default async function reservationDatesPage() {
  const session = await auth();
  if (!session) {
    return notFound();
  }

  const isAdmin = session.userRole === 'ADMIN';
  return (
    <div className="space-y-7" suppressHydrationWarning>
      <Suspense fallback={<Skeleton className="h-auto w-auto" />}>
        <div>
          <h2 className="Text-lg font-medium">Reservation Dates </h2>
        </div>
      </Suspense>
    </div>
  );
}
