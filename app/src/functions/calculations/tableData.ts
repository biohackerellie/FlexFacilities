import moment from "moment";

import type {
  CategoryType,
  FacilityType,
  ReservationDateType,
  ReservationType,
  UserType,
} from "@local/db/schema";

const dateOptions = {};
interface TableData extends ReservationType {
  ReservationDate: ReservationDateType[];
  Facility: FacilityType;
  User?: Partial<UserType>;
}

function mapRequests(requests: TableData[]) {
  const mappedRequests = requests.map((requests) => {
    const sortedDates = requests.ReservationDate.sort((a, b) =>
      moment(a.startDate).diff(moment(b.startDate)),
    );
    return {
      eventName: requests.eventName,
      Facility: requests.Facility.name,
      ReservationDate: sortedDates[0]?.startDate || "No Dates Defined",
      approved: requests.approved,
      User: requests.User?.name || "",
      Details: requests.id,
    };
  });
  return mappedRequests;
}

function mapReservations(Reservations: TableData[]) {
  const currentDate = moment();

  const mappedReservations = Reservations.map((reservation) => {
    const sortedDates = reservation.ReservationDate.sort((a, b) =>
      moment(a.startDate, "YYYY-MM-DD").diff(moment(b.startDate, "YYYY-MM-DD")),
    );
    const nextUpcomingDate = sortedDates?.find(
      (date) => moment(date.startDate, "YYYY-MM-DD") >= currentDate,
    );
    return {
      eventName: reservation.eventName,
      Facility: reservation.Facility.name,
      ReservationDate: nextUpcomingDate?.startDate,
      approved: reservation.approved,
      User: reservation.User?.name || "",
      Details: reservation.id,
    };
  }).filter((reservation) => reservation !== null);
  return mappedReservations;
}
function mapPastReservations(Reservations: TableData[]) {
  const currentDate = moment();
  const mappedReservations = Reservations.map((reservation) => {
    const sortedDates = reservation.ReservationDate.sort((a, b) =>
      moment(a.startDate, "YYYY-MM-DD").diff(moment(b.startDate, "YYYY-MM-DD")),
    );

    const nextUpcomingDate = sortedDates?.find(
      (date) => moment(date.startDate, "YYYY-MM-DD") >= currentDate,
    );
    const reservationDate = reservation.ReservationDate.map(
      (date) => date.startDate,
    );

    return {
      eventName: reservation.eventName,
      Facility: reservation.Facility.name,
      ReservationDate: reservationDate[0],
      approved: reservation.approved,
      User: reservation.User?.name || "",
      Details: reservation.id,
    };
  }).filter((reservation) => reservation !== null);
  return mappedReservations;
}

function mapDates(ReservationDates: any[]) {
  const mappedDates = ReservationDates.map((date) => {
    return {
      Options: Number(date.id),
      startDate: date.startDate,
      endDate: date.endDate,
      startTime: date.startTime,
      endTime: date.endTime,
      approved: date.approved,
      ReservationID: Number(date.reservationId),
    };
  });
  return mappedDates;
}

function userReservations(Reservations: TableData[]) {
  const currentDate = moment();
  const mappedReservations = Reservations.map((reservation) => {
    const sortedDates = reservation.ReservationDate.sort((a, b) =>
      moment(a.startDate).diff(moment(b.startDate)),
    );
    const nextUpcomingDate = sortedDates?.find(
      (date) => moment(date.startDate) >= currentDate,
    );

    const mostRecentPastDate = sortedDates[sortedDates.length - 1];

    return {
      eventName: reservation.eventName,
      Facility: reservation.Facility.name,
      ReservationDate: nextUpcomingDate
        ? nextUpcomingDate.startDate
        : mostRecentPastDate?.startDate,
      approved: reservation.approved,
      id: reservation.id,
    };
  });
  return mappedReservations;
}

function mappedFacilities(facilities: FacilityWithCategory[]) {
  const mappedFacilities = facilities.map((facility) => {
    return {
      id: facility.id,
      name: facility.name,
      building: facility.building,
      address: facility.address,
      imagePath: facility.imagePath,
      capacity: facility.capacity,
      googleCalendarId: facility.googleCalendarId,
      Category: [facility.Category],
    } as const;
  });
  return mappedFacilities;
}

interface FacilityWithCategory extends FacilityType {
  Category: CategoryType[];
}

function mapFacilityTable(facilities: FacilityWithCategory[]) {
  const mappedFacilities = facilities
    .map((facility) => {
      return {
        id: facility.id,
        name: facility.name,
        building: facility.building,
        address: facility.address,
        imagePath: facility.imagePath,
        capacity: facility.capacity,
        googleCalendarId: facility.googleCalendarId,
        //eslint-disable-next-line
        Category: facility.Category?.map((category) => category.price),
      };
    })
    .flat();
  return mappedFacilities;
}

export {
  mapRequests,
  mapReservations,
  mapDates,
  userReservations,
  mappedFacilities,
  mapFacilityTable,
  mapPastReservations,
};
