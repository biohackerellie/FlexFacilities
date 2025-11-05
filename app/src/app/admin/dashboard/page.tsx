import { School } from 'lucide-react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AggregateChartData } from '@/lib/actions/reservations';
import { client } from '@/lib/rpc';
import ByMonthLine from './charts/byMonth-Line';

export default async function DashboardPage() {
  const { data: totalCount, error: countError } = await client
    .reservations()
    .requestCount({});
  const { data: thisWeekData, error: weeklyCountError } = await client
    .reservations()
    .getRequestsThisWeek({});

  if (countError || weeklyCountError || !totalCount || !thisWeekData) {
    return (
      <div className='flex flex-col'>
        <pre className='text-sm text-red-500'>
          <code>{countError?.message}</code>
        </pre>
        <pre className='text-sm text-red-500'>
          <code>{weeklyCountError?.message}</code>
        </pre>
      </div>
    );
  }

  const count = totalCount?.count ?? 0;
  const weeklyCount = thisWeekData?.reservations.length ?? 0;
  return (
    <div className='flex flex-col'>
      <div className='flex-1 space-y-4 p-8'>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='payments'>Payments</TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <div className='grid gap-4 m-2 md:grid-cols-2 lg:grid-cols-4'>
              <Suspense fallback={<Skeleton className='h-auto w-auto' />}>
                <Card className=''>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Upcoming Events
                    </CardTitle>

                    <School size={16} strokeWidth={1} />
                  </CardHeader>

                  <CardContent>
                    <div className='text-right text-2xl font-bold'>
                      {weeklyCount}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Events in the next 7 days
                    </p>
                  </CardContent>
                </Card>
              </Suspense>
              <Suspense fallback={<Skeleton className='h-auto w-auto' />}>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Pending Requests
                    </CardTitle>
                    <School size={16} strokeWidth={1} />
                  </CardHeader>
                  <CardContent>
                    <div className='text-right text-2xl font-bold'>{count}</div>
                  </CardContent>
                </Card>
              </Suspense>
            </div>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card className='col-span-4'>
                <CardHeader>
                  <CardTitle className='text-muted-foreground'>
                    Requests per building
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex'>
                  <Suspense
                    fallback={<Skeleton className='h-[300px] w-[500px]' />}
                  >
                    <ByMonthLine dataPromise={AggregateChartData()} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// async function getData() {
//   // TODO: cache

//   if (countError || weeklyCountError) {
//     return { count: 0, weeklyCount: 0 };
//   }
//   const count = totalCount?.count ?? 0;
//   const weeklyCount = thisWeekData?.reservations.length ?? 0;
//   return { count, weeklyCount };
// }
