'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenueData } from '@/lib/types';

export default function MonthlyRevChart({ data }: { data: RevenueData[] }) {
  console.log(data);
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={760} height={500} data={data}>
          <CartesianGrid strokeDasharray={'3 3'} />
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
          <ReferenceLine y={0} stroke="#000" />
          <Bar minPointSize={0} dataKey="Revenue" fill="#22c55e">
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill="#22c55e" />
            ))}
          </Bar>
          <Bar minPointSize={0} dataKey="Loss" fill="#ff0000" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
