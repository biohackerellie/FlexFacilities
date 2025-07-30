import { Suspense } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/tables/reservations/reservation/data-table";
import { IsAdmin } from "@/functions/other/helpers";
import { api } from "@/trpc/server";
import { adminColumns } from "./adminColumns";
import { columns } from "./columns";

export default async function reservationDatesPage({
  params,
}: {
  params: { id: string };
}) {
  const isAdmin = await IsAdmin();
  const AddDates = dynamic(() => import("@/components/ui/alerts/addDates"));
  const reservation = await api.reservation.byId({ id: parseInt(params.id) });
  if (!reservation) return notFound();
  const mappedDates = reservation.ReservationDate;
  return (
    <div className="space-y-7" suppressHydrationWarning>
      <Suspense fallback={<Skeleton className="h-auto w-auto" />}>
        <div>
          <h2 className="Text-lg font-medium">Reservation Dates </h2>
        </div>

        {isAdmin ? (
          <>
            <DataTable columns={adminColumns} data={mappedDates} />
            <div className="float-right">
              <AddDates id={parseInt(params.id)} />
            </div>
          </>
        ) : (
          <>
            <DataTable columns={columns} data={mappedDates} />
          </>
        )}
      </Suspense>
    </div>
  );
}
