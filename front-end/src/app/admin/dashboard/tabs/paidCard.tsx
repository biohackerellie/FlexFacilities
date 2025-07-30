import * as React from "react";
import { School } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyRevenue from "@/functions/calculations/revPerMonth";
import MonthlyRevChart from "../charts/monthlyRev";

export default function PaidCard({
  dataPromise,
}: {
  dataPromise: ReturnType<typeof MonthlyRevenue>;
}) {
  const Revenue = React.use(dataPromise);
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>

            <School size={16} strokeWidth={1} />
          </CardHeader>

          <CardContent>
            <div className="text-right text-2xl font-bold text-green-500">
              +${Revenue.totalPositive}
            </div>
            <p className="text-xs text-muted-foreground">
              over the last 6 months
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
            <School size={16} strokeWidth={1} />
          </CardHeader>
          <CardContent>
            <div className="text-right text-2xl font-bold text-red-500">
              -${Revenue.totalNegative}
            </div>
            <p className="text-xs text-muted-foreground">
              over the last 6 months
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              Revenue per month
            </CardTitle>
          </CardHeader>
          <CardContent className="flex">
            <MonthlyRevChart data={Revenue.revChartData} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
