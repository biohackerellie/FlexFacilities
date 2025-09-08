'use server';
// @ts-nocheck
// TODO: rewrite this in golang
/**
 * This function is used to calculate the monthly revenue for the last 6 months
 */
import type { RevenueData } from '@/lib/types';
import {
  compareAsc,
  format,
  isAfter,
  isBefore,
  lastDayOfMonth,
  parse,
  sub,
} from 'date-fns';

import { CostReducer } from '../other/helpers';

interface ReservationClassType extends ReservationType {
  ReservationDate: ReservationDateType[];
  ReservationFees: ReservationFeesType[];
  Category: CategoryType;
}
export default async function MonthlyRevenue(): Promise<{
  revChartData: RevenueData[];
  totalPositive: number;
  totalNegative: number;
}> {
  const data = await api.reservation.all();
  // initialize variables
  const aggregateData: any = {};
  const now = lastDayOfMonth(new Date());
  const sixMonthsAgo = sub(now, { months: 6 });
  let totalPositive = 0;
  let totalNegative = 0;

  /* filter down to reservations where the last reservation
   *	 date is within the last 6 months, and the reservation is approved
   */
  const reducedData = data.filter(
    (reservation) =>
      reservation.ReservationDate?.some(
        (date) => date.approved === 'approved',
      ) &&
      isAfter(
        new Date(
          reservation.ReservationDate.reduce((a, b) => {
            return new Date(a.startDate) > new Date(b.startDate) ? a : b;
          }).startDate,
        ),
        sixMonthsAgo,
      ) &&
      isBefore(
        new Date(
          reservation.ReservationDate.reduce((a, b) => {
            return new Date(a.startDate) > new Date(b.startDate) ? a : b;
          }).startDate,
        ),
        now,
      ),
  );

  /**
   * For Each Reservation, calculate the cost and add or subtract it from the revenue
   */

  reducedData.forEach((reservation: ReservationClassType) => {
    const month = reservation.ReservationDate
      ? format(new Date(reservation.ReservationDate[0]?.startDate!), 'MMMM')
      : '';

    const cost = CostReducer({
      ReservationFees: reservation.ReservationFees,
      ReservationDate: reservation.ReservationDate,
      categoryId: reservation.categoryId,
      Category: reservation.Category,
      CategoryPrice: reservation.Category.price,
    });
    const numericCost = Number(cost.toFixed()) || 0;
    if (!aggregateData[month]) {
      aggregateData[month] = { Revenue: 0, Loss: 0 };
    }
    if (reservation.paid === false) {
      aggregateData[month].Loss -= numericCost;
      totalNegative += numericCost;
    }
    if (reservation.paid === true) {
      aggregateData[month].Revenue += numericCost;
      totalPositive += numericCost;
    }
  });

  const chartData: RevenueData[] = [];
  Object.keys(aggregateData).forEach((month) => {
    const dataEntry: RevenueData = {
      month,
      Revenue: aggregateData[month].Revenue,
      Loss: aggregateData[month].Loss,
    };
    chartData.push(dataEntry);
  });

  const sortedChartData = chartData.sort((a, b) => {
    const monthA = parse(a.month!, 'MMMM', new Date());
    const monthB = parse(b.month!, 'MMMM', new Date());
    return compareAsc(monthA, monthB);
  });
  console.log(sortedChartData);
  return { revChartData: sortedChartData, totalPositive, totalNegative };
}
