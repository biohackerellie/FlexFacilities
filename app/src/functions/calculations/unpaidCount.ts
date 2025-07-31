"use server";

import type { ReservationClassType } from "@/lib/classes";
import moment from "moment";

import { ReservationClass } from "@/lib/classes";
import { api } from "@/trpc/server";
import { CostReducer } from "../other/helpers";

type ChartData = Record<string, number | string | undefined>;

export default async function WeeklyUnpaidCount() {
  const data = await api.reservation.all();
  let reservationCount = 0;

  let cost = 0;
  const filteredData = data.filter(
    (reservation) =>
      reservation.paid === false &&
      reservation.ReservationDate?.some(
        (date) =>
          date.approved === "approved" &&
          moment(date.startDate).isBetween(moment(), moment().add(7, "days")),
      ),
  );

  filteredData.forEach((reservation) => {
    cost = CostReducer({
      Category: reservation.Category,
      categoryId: reservation.categoryId,
      CategoryPrice: reservation.Category.price,
      ReservationDate: reservation.ReservationDate,
      ReservationFees: reservation.ReservationFees,
    });
    if (cost > 0) {
      reservationCount++;
    }
  });
  return Number(reservationCount);
}
