'use client';

import { School } from 'lucide-react';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeeklyUnpaidCount from '@/functions/calculations/unpaidCount';

export default function UnpaidCard({
  dataPromise,
}: {
  dataPromise: ReturnType<typeof WeeklyUnpaidCount>;
}) {
  const unpaidCount = React.use(dataPromise);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Unpaid Requests</CardTitle>
        <School size={16} strokeWidth={1} />
      </CardHeader>
      <CardContent>
        <div className="text-right text-2xl font-bold">{unpaidCount}</div>
        <p className="text-xs text-muted-foreground">
          Events in the next 7 days that owe money
        </p>
      </CardContent>
    </Card>
  );
}
