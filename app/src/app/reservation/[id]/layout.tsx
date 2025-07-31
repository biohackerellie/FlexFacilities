import type { ReservationClassType } from "@/lib/classes";
import React, { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import type { SideBarType } from "@local/validators/constants";

import IsUserReserv from "@/components/contexts/isUserReserv";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import range from "@/functions/calculations/dateRange";
import { IsAdmin } from "@/functions/other/helpers";
import { api } from "@/trpc/server";
import AdminPanel from "./adminButtons";

export default async function reservationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const [data, isAdmin] = await getData(parseInt(params.id));
  const reservation = data;
  if (!reservation) return notFound();
  const { id, eventName, Facility } = reservation;

  const reservationItems: SideBarType = [
    {
      title: "Summary",
      href: `/reservation/${id}`,
    },
    {
      title: "Insurance",
      href: `/reservation/${id}/Insurance`,
    },
    {
      title: "Pricing & Payments",
      href: `/reservation/${id}/Pricing`,
    },
    {
      title: "Reservation Dates",
      href: `/reservation/${id}/Dates`,
    },
    {
      title: `${reservation.Facility?.name} Calendar`,
      href: `/reservation/${id}/Calendar`,
    },
  ];

  return (
    <IsUserReserv reservation={reservation}>
      <div className="container relative">
        <div className="sm:hidden">{children}</div>
        <div className="hidden space-y-6 p-10 pb-16 sm:block">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold">{eventName}</h1>
            <h2 className="text-muted-foreground">
              {Facility?.building} {Facility?.name}
            </h2>
            <h3 className="text-muted-foreground">
              {range(reservation.ReservationDate)}
            </h3>
            <Suspense fallback={<></>}>
              {isAdmin && (
                <div className="relative float-right self-start p-4 sm:right-0 sm:self-end sm:p-0">
                  <AdminPanel id={id} facility={reservation.Facility} />
                </div>
              )}
            </Suspense>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <SidebarNav items={reservationItems} />
            </aside>
            <div className="flex-1 lg:max-w-4xl">{children}</div>
          </div>
        </div>
      </div>
    </IsUserReserv>
  );
}

async function getData(id: number) {
  const res = api.reservation.byId({ id: id });

  const isAdmin = IsAdmin();

  return Promise.all([res, isAdmin]);
}

// const cachedData = cache(async (id: number) => getData(id), ["reservations"]);
