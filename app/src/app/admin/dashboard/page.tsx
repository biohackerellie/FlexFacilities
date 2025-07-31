import { Suspense } from "react";
import { School } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import aggregateChartData from "@/functions/calculations/reservsByMonth";
import MonthlyRevenue from "@/functions/calculations/revPerMonth";
import WeeklyUnpaidCount from "@/functions/calculations/unpaidCount";
import { api } from "@/trpc/server";
import ByMonthLine from "./charts/byMonth-Line";
import PaidCard from "./tabs/paidCard";
import UnpaidCard from "./tabs/unpaidcard";

export default async function DashboardPage() {
  const { count, weeklyCount } = await getData();
  const totalCount = count[0]?.value!;
  const weekly = weeklyCount[0]?.count!;

  return (
    <>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<Skeleton className="h-auto w-auto" />}>
                  <Card className="">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Upcoming Events
                      </CardTitle>

                      <School size={16} strokeWidth={1} />
                    </CardHeader>

                    <CardContent>
                      <div className="text-right text-2xl font-bold">
                        {weekly}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Events in the next 7 days
                      </p>
                    </CardContent>
                  </Card>
                </Suspense>
                <Suspense fallback={<Skeleton className="h-auto w-auto" />}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pending Requests
                      </CardTitle>
                      <School size={16} strokeWidth={1} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-right text-2xl font-bold">
                        {totalCount}
                      </div>
                    </CardContent>
                  </Card>
                </Suspense>
                <Suspense fallback={<Skeleton className="h-auto w-auto" />}>
                  <UnpaidCard dataPromise={WeeklyUnpaidCount()} />
                </Suspense>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle className="text-muted-foreground">
                      Requests per building
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex">
                    <Suspense
                      fallback={<Skeleton className="h-[300px] w-[500px]" />}
                    >
                      <ByMonthLine dataPromise={aggregateChartData()} />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="payments">
              <Suspense fallback={<Skeleton className="h-auto w-auto" />}>
                <PaidCard dataPromise={MonthlyRevenue()} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

async function getData() {
  const totalCount = api.reservation.requestCount();
  const thisWeek = api.reservation.thisWeek();
  // const thisWeek = Promise.resolve({ count: 1 }) as unknown as number;
  const [count, weeklyCount] = await Promise.all([totalCount, thisWeek]);

  return { count, weeklyCount };
}
