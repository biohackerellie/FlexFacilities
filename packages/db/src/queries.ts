import { and, asc, count, eq, gte, like, lt, lte, or, sql } from "drizzle-orm";
import moment from "moment";

import { db } from "./client";
import {
  Category,
  Events,
  Facility,
  Reservation,
  ReservationDate,
  User,
} from "./schema";

const currentDate = moment();
const sevenDaysFromNow = moment().add(7, "days");
const today = new Date().toISOString();

/**
 * Users
 */

export const UserByEmail = db.query.User.findFirst({
  where: eq(User.email, sql.placeholder("email")),
  columns: {
    password: false,
  },
}).prepare("user_by_email");

export const GetUsers = db.query.User.findMany({
  columns: {
    password: false,
  },
}).prepare("get_users");

export const GetUserById = db.query.User.findFirst({
  where: eq(User.id, sql.placeholder("id")),
  columns: {
    password: false,
  },
  with: {
    Reservation: {
      with: {
        Facility: true,
        ReservationDate: true,
        ReservationFees: true,
        Category: true,
      },
    },
  },
}).prepare("get_user_by_id");

/**
 * Reservations
 */

export const GetRequests = db.query.Reservation.findMany({
  where: eq(Reservation.approved, "pending"),
  with: {
    Facility: true,
    ReservationDate: true,
    User: {
      columns: {
        password: false,
      },
    },
  },
}).prepare("requests");

export const GetReservations = db.query.Reservation.findMany({
  where: eq(Reservation.approved, "approved"),

  with: {
    Facility: true,
    ReservationDate: true,
    Category: true,
    User: {
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        tos: true,
      },
    },
  },
}).prepare("reservations");

export const GetReservationbyID = db.query.Reservation.findFirst({
  where: eq(Reservation.id, sql.placeholder("id")),
  with: {
    Facility: true,
    ReservationDate: true,
    ReservationFees: true,
    Category: true,
    User: {
      columns: {
        password: false,
      },
    },
  },
}).prepare("reservationByID");

export const GetApprovedDates = db.query.ReservationDate.findMany({
  where: and(
    eq(ReservationDate.approved, "approved"),
    eq(ReservationDate.reservationId, sql.placeholder("reservationId")),
  ),
  with: {
    Reservation: {
      with: {
        Facility: true,
      },
    },
  },
}).prepare("approvedDates");

export const GetDateByID = db.query.ReservationDate.findFirst({
  where: eq(ReservationDate.id, sql.placeholder("id")),
  with: {
    Reservation: {
      with: {
        Facility: true,
      },
    },
  },
}).prepare("dateByID");

export const GetAllReservations = db.query.Reservation.findMany({
  with: {
    ReservationDate: true,
    Facility: true,
    Category: true,
    ReservationFees: true,
    User: {
      columns: {
        password: false,
      },
    },
  },
  where: or(
    eq(Reservation.approved, "approved"),
    eq(Reservation.approved, "pending"),
  ),
});

export const ReservationCountThisWeek = db
  .select({ count: count() })
  .from(Reservation)
  .where(
    and(
      gte(ReservationDate.startDate, currentDate.format("YYYY-MM-DD")),
      lte(ReservationDate.startDate, sevenDaysFromNow.format("YYYY-MM-DD")),
      eq(ReservationDate.approved, "approved"),
    ),
  )
  .prepare("reservationCountThisWeek");

export const UnPaidReservations = db.query.Reservation.findMany({
  with: {
    Facility: true,
    ReservationDate: {
      where: and(
        gte(ReservationDate.startDate, currentDate.format("YYYY-MM-DD")),
      ),
    },
    Category: true,
    User: {
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        tos: true,
      },
    },
  },
}).prepare("unPaidReservations");

/**
 * Facilities
 */

export const FacilityQuery = db.query.Facility.findFirst({
  where: eq(Facility.id, sql.placeholder("id")),
  with: {
    Category: true,
    Reservation: true,
    Events: {
      where: and(gte(Events.start, today), or(gte(Events.end, today))),
    },
  },
}).prepare("single_Facility");

export const FacilitiesQuery = db
  .select()
  .from(Facility)
  .leftJoin(Category, eq(Category.facilityId, Facility.id))
  .prepare("facilities");

export const BuildingQuery = db.query.Facility.findMany({
  where: eq(Facility.building, sql.placeholder("building")),
}).prepare("building_Facility");

export const BuildingnameQuery = db.query.Facility.findFirst({
  where: like(Facility.building, sql.placeholder("building")),
}).prepare("buildingname_Facility");

/**
 * Events
 */

export const EventsQuery = db.query.Events.findMany({
  where: eq(Events.placeholder, false),
  with: {
    Facility: true,
  },
}).prepare("events");

export const AllEventsQuery = db.query.Events.findMany({
  with: {
    Facility: true,
  },
}).prepare("allEvents");

export const EventsByFacilityIdQuery = db.query.Events.findMany({
  where: and(
    eq(Events.facilityId, sql.placeholder("facilityId")),
    eq(Events.placeholder, false),
  ),
  with: {
    Facility: true,
  },
}).prepare("eventsByFacilityId");

export const SortedEventsQuery = db.query.Events.findMany({
  where: and(
    eq(Events.placeholder, false),
    eq(Events.facilityId, sql.placeholder("facilityId")),
    gte(Events.start, sql.placeholder("start")),
    lt(Events.start, sql.placeholder("end")),
  ),
  with: {
    Facility: true,
  },
  orderBy: [asc(Events.start)],
}).prepare("sortedEvents");

/**
 * Categories
 */

export const CategoryByFacility = db.query.Category.findFirst({
  where: and(
    eq(Category.facilityId, sql.placeholder("facilityId")),
    like(Category.name, sql.placeholder("name")),
  ),
}).prepare("category_by_facility");
