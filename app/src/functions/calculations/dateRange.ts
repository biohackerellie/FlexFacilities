import type { ReservationDateType } from "@local/db/schema";

export default function range(ReservationDate: ReservationDateType[]): string {
  let dateRange = "";
  if (ReservationDate.length > 1) {
    dateRange = `${ReservationDate[0]?.startDate} - ${
      ReservationDate[ReservationDate.length - 1]?.endDate
    }`;
  } else if (ReservationDate.length === 1) {
    dateRange = `${ReservationDate[0]?.startDate}`;
  } else {
    dateRange = "No Upcoming Dates";
  }

  return dateRange;
}
