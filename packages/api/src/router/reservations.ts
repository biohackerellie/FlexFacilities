import type { TRPCRouterRecord } from "@trpc/server";
import { addDays, format } from "date-fns";
import { z } from "zod";

import { and, count, eq, gte, lte, or } from "@local/db";
import {
  CreateReservationDateArray,
  CreateReservationSchema,
  Facility,
  Reservation,
  ReservationDate,
} from "@local/db/schema";

import { protectedProcedure } from "../trpc";

const today = new Date();
const sevenDaysFromNow = addDays(today, 7);

export const ReservationRouter = {
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Reservation.findMany({
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
  }),
  requestCount: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select({ value: count() })
      .from(Reservation)
      .where(eq(Reservation.approved, "pending"));
  }),
  thisWeek: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select({ count: count() })
      .from(ReservationDate)
      .where(
        and(
          gte(ReservationDate.startDate, format(today, "yyyy-MM-dd")),
          lte(
            ReservationDate.startDate,
            format(sevenDaysFromNow, "yyyy-MM-dd"),
          ),
          eq(ReservationDate.approved, "approved"),
        ),
      );
  }),
  allRequests: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Reservation.findMany({
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
    });
  }),
  allApproved: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Reservation.findMany({
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
    });
  }),
  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Reservation.findFirst({
        where: eq(Reservation.id, input.id),
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
      });
    }),
  approvedDates: protectedProcedure
    .input(z.object({ reservationId: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.ReservationDate.findMany({
        where: and(
          eq(ReservationDate.approved, "approved"),
          eq(ReservationDate.reservationId, input.reservationId),
        ),
        with: {
          Reservation: {
            with: {
              Facility: true,
            },
          },
        },
      });
    }),
  dateById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.ReservationDate.findFirst({
        where: eq(ReservationDate.id, input.id),
        with: {
          Reservation: {
            with: {
              Facility: true,
            },
          },
        },
      });
    }),
  createReservation: protectedProcedure
    .input(CreateReservationSchema)
    .mutation(async ({ ctx, input }) => {
      const [newId] = await ctx.db
        .insert(Reservation)
        .values(input)
        .returning({ id: Reservation.id });
      return newId;
    }),

  usersReservations: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.db
        .select({
          eventName: Reservation.eventName,
          Facility: Facility.name,
          ReservationDate: ReservationDate.startDate,
          approved: Reservation.approved,
          id: Reservation.id,
        })
        .from(Reservation)
        .where(eq(Reservation.userId, input.userId))
        .innerJoin(Facility, eq(Reservation.facilityId, Facility.id))
        .innerJoin(
          ReservationDate,
          eq(Reservation.id, ReservationDate.reservationId),
        );
    }),

  createReservationDates: protectedProcedure
    .input(CreateReservationDateArray)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(ReservationDate).values(input);
    }),
} satisfies TRPCRouterRecord;
