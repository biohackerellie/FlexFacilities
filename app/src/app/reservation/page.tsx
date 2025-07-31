import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@local/auth";

import ReservationForm from "@/components/forms/reservationForm2";
import { Skeleton } from "@/components/ui/skeleton";

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
    redirect("/login");
  }
  return (
    <section className="my-4 flex flex-col justify-center sm:flex-row">
      <Suspense fallback={<Loading />}>
        <ReservationForm email={session.user.email!} userId={session.user.id} />
      </Suspense>
    </section>
  );
}
