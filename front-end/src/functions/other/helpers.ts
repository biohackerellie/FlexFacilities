import { auth } from "@local/auth";
import {
  CategoryType,
  ReservationDateType,
  ReservationFeesType,
} from "@local/db/schema";

export async function IsAdmin() {
  const session = await auth();
  if (!session) return false;
  if (
    session?.user.role === "ADMIN_ADMIN" ||
    session?.user.role === "CAL_ADMIN" ||
    session?.user.role === "GR_ADMIN" ||
    session?.user.role === "LHS_ADMIN" ||
    session?.user.role === "LMS_ADMIN" ||
    session?.user.role === "WE_ADMIN" ||
    session?.user.role === "SO_ADMIN" ||
    session?.user.role === "SUP_ADMIN"
  ) {
    return true;
  } else {
    return false;
  }
}

interface CR {
  ReservationFees: ReservationFeesType[] | [];
  ReservationDate: ReservationDateType[] | [];
  categoryId: number;
  Category: CategoryType | null;
  CategoryPrice: number;
}

export function CostReducer(props: CR) {
  let additionalFeesTotal = 0;
  const ReservationFees = props.ReservationFees || [];
  const ReservationDate = props.ReservationDate || [];
  const categoryId = props.categoryId;
  const Category = props.Category || null;
  const CategoryPrice = Category?.price || 0;
  let totalCost = 0;
  if (ReservationFees.length > 0) {
    for (let i = 0; i < ReservationFees.length; i++) {
      if (i === null) continue;

      additionalFeesTotal += ReservationFees[i]?.additionalFees!;
    }
  }
  const approvedReservationDates = ReservationDate.filter(
    (reservationDate: any) => {
      return reservationDate.approved === "approved";
    },
  );
  if (categoryId === 105 || categoryId === 106 || categoryId === 107) {
    totalCost = CategoryPrice + additionalFeesTotal;
  } else {
    const totalHours = approvedReservationDates.reduce(
      (acc: any, reservationDate: any) => {
        const startTime: any = new Date(
          `1970-01-01T${reservationDate.startTime}Z`,
        );
        const endTime: any = new Date(`1970-01-01T${reservationDate.endTime}Z`);
        const hours = Math.abs(endTime - startTime) / 36e5;
        return acc + hours;
      },
      0,
    );
    totalCost = totalHours * CategoryPrice + additionalFeesTotal;
  }
  return Number(totalCost.toFixed(2));
}
