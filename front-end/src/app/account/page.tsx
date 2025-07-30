import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { ReloadIcon } from "@radix-ui/react-icons";

import { auth } from "@local/auth";

import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/tables";
import { userReservations } from "@/functions/calculations/tableData";
import { api } from "@/trpc/server";
import { columns } from "./columns";

async function getData(id: string) {
  const user = await api.user.ById({ id: id });
  const reservations = user?.Reservation;
  if (!reservations) {
    return [];
  }
  return userReservations(reservations);
}

export default async function Account() {
  const session = await auth();
  if (!session) return notFound();
  const data = await getData(session.user.id);
  if (!data) {
    return <div>loading ...</div>;
  }

  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-lg font-medium">My Reservations</h3>
      </div>
      <Separator />

      <Suspense fallback={<LoadingComponent />}>
        <DataTable columns={columns} data={data} />
      </Suspense>
    </div>
  );
}

const LoadingComponent = () => {
  return (
    <div>
      Loading <ReloadIcon className="animate-spin h-4 w-4" />
    </div>
  );
};
