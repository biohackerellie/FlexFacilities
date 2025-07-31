import React, { Suspense } from "react";
import { notFound } from "next/navigation";

import { ShowPayment } from "@/components/forms";
import EditPricing from "@/components/forms/paymentModal";
import { Button } from "@/components/ui/buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/tables/reservations/data-table";
import { Paid } from "@/functions/mutations";
import { CostReducer, IsAdmin } from "@/functions/other/helpers";
import { ReservationClass } from "@/lib/classes";
import { api } from "@/trpc/server";
import { adminColumns } from "./adminColumns";
import { columns } from "./columns";
import Options from "./options";

export default async function paymentPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id);

  const reservation = await api.reservation.byId({ id: id });
  if (!reservation) return notFound();

  const description = `${reservation.eventName} at ${reservation.Facility?.building} ${reservation.Facility?.name} by ${reservation.User?.name}`;
  const email = reservation.User?.email || "";

  const CategoryPrice = reservation.Category?.price;
  const mappedFees = reservation.ReservationFees
    ? reservation.ReservationFees.map((fee) => {
        return {
          additionalFees: fee.additionalFees ?? 0,
          feesType: fee.feesType ?? "",
          options: fee.id,
        };
      })
    : [];

  const totalCost = CostReducer({
    ReservationFees: reservation.ReservationFees,
    ReservationDate: reservation.ReservationDate,
    categoryId: reservation.categoryId,
    Category: reservation.Category,
    CategoryPrice: CategoryPrice,
  });

  const isAdmin = await IsAdmin();

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
                  <Options id={id} facilityID={reservation.facilityId} />
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
              {!reservation.paid && !reservation.costOverride && (
                <>
                  <div className="text-sm font-thin text-muted-foreground">
                    Cost Per Hour: ${CategoryPrice} * Total Hours + any
                    additional fees = <br />
                  </div>
                  <div className="float-right">Total: ${totalCost}</div>
                </>
              )}{" "}
              {!reservation.paid && reservation.costOverride && (
                <>Total: ${reservation.costOverride}</>
              )}
              {reservation.paid && <>Total: reservation.Paid!</>}
            </div>
          </div>

          <div className="flex justify-end text-justify text-xl">
            {!reservation.paid &&
              (totalCost > 0 ||
                (reservation.costOverride && reservation.costOverride > 0)) && (
                <>
                  {isAdmin ? (
                    <div className="my-2 flex justify-end border-b-2 border-b-gray-700 p-2 text-justify text-xl dark:border-b-white">
                      <span className="text-red-500">Not Paid</span>
                      <form action={Paid}>
                        <input type="hidden" name="id" value={id} />
                        <Button>Mark as Paid</Button>
                      </form>
                    </div>
                  ) : (
                    <ShowPayment
                      id={id}
                      fees={
                        reservation.costOverride
                          ? reservation.costOverride
                          : totalCost
                      }
                      description={description}
                      email={email}
                    />
                  )}
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
