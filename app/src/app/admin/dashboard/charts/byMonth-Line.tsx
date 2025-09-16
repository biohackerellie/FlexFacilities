'use client';

import * as React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AggregateChartData } from '@/lib/actions/reservations';

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
export default function ByMonthLine({
  dataPromise,
}: {
  dataPromise: ReturnType<typeof AggregateChartData>;
}) {
  const data = React.use(dataPromise);

  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart width={500} height={300} data={data?.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip />
          <Legend />
          {data &&
            data.data.map((v, i) => {
              return (
                <Line
                  connectNulls
                  key={i}
                  type="monotone"
                  dataKey={v.month}
                  stroke={getRandomColor()}
                />
              );
            })}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
