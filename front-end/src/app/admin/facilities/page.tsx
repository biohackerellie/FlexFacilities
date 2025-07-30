import { Suspense } from "react";

import { DataTable } from "@/components/ui/tables";
import { mapFacilityTable } from "@/functions/calculations/tableData";
import { api } from "@/trpc/server";
import TableSkeleton from "../requests/skeleton";
import { columns } from "./columns";

async function getFacilities() {
  const facilities = await api.facility.all();
  return mapFacilityTable(facilities);
}

export default async function adminFacilitiesPage() {
  const data = await getFacilities();

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-lg font-medium">Facilities</h1>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <DataTable columns={columns} data={data} />
      </Suspense>
    </div>
  );
}
