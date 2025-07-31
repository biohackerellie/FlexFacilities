import type { Reservation } from "@/lib/types";
import { headers } from "next/headers";

import { DataTable } from "@/components/ui/tables";
import { mapRequests } from "@/functions/calculations/tableData";
import { TableReservation } from "@/lib/types";
import { api } from "@/trpc/server";
import { columns } from "./columns";

async function getData() {
  const data = await api.reservation.allRequests();
  return mapRequests(data);
}

export default async function Requests() {
  const data = await getData();
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-lg font-medium">Requests</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
