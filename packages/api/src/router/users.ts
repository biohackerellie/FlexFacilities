import type { TRPCRouterRecord } from "@trpc/server";
import { format } from "date-fns";
import { z } from "zod";

import { eq, gte, inArray, or } from "@local/db";
import {
  CreateEmailNotificationsSchema,
  CreateUserSchema,
  EmailNotifications,
  ReservationDate,
  UpdateEmailNotificationsSchema,
  User,
} from "@local/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

const adminRoles: (
  | "ADMIN_ADMIN"
  | "CAL_ADMIN"
  | "GR_ADMIN"
  | "LHS_ADMIN"
  | "LMS_ADMIN"
  | "WE_ADMIN"
  | "SO_ADMIN"
  | "SUP_ADMIN"
)[] = [
  "ADMIN_ADMIN",
  "CAL_ADMIN",
  "GR_ADMIN",
  "LHS_ADMIN",
  "LMS_ADMIN",
  "WE_ADMIN",
  "SO_ADMIN",
  "SUP_ADMIN",
];
const adminCondition = or(...adminRoles.map((role) => eq(User.role, role)));

const today = new Date();
export const UserRouter = {
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.select().from(User);
  }),

  ByEmail: protectedProcedure
    .input(z.object({ email: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db
        .select({
          id: User.id,
          name: User.name,
          email: User.email,
          role: User.role,
          tos: User.tos,
        })
        .from(User)
        .where(eq(User.email, input.email));
    }),
  ById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.User.findFirst({
        where: eq(User.id, input.id),
        columns: {
          password: false,
        },
        with: {
          Reservation: {
            with: {
              ReservationDate: {
                where: gte(
                  ReservationDate.startDate,
                  format(today, "yyyy-MM-dd"),
                ),
              },
              Facility: true,
              ReservationFees: true,
            },
          },
        },
      });
    }),
  NewUser: publicProcedure
    .input(CreateUserSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(User).values(input);
    }),
  GetEmailPrefsByAddress: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.EmailNotifications.findFirst({
      where: eq(EmailNotifications.email, ctx.session.User.email!),
    });
  }),

  GetEmailsForAdminUsers: protectedProcedure.query(async ({ ctx }) => {
    const admins = await ctx.db.query.User.findMany({
      where: adminCondition,
    });
    const adminEmails = admins.map((admin) => admin.email);
    return ctx.db.query.EmailNotifications.findMany({
      where: inArray(EmailNotifications.email, adminEmails),
    });
  }),
  DeleteEmailPrefsByAddress: protectedProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(EmailNotifications)
        .where(eq(EmailNotifications.email, input.email));
    }),
  UpdateEmailPrefs: protectedProcedure
    .input(UpdateEmailNotificationsSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.id === undefined) throw new Error();
      return ctx.db
        .update(EmailNotifications)
        .set(input)
        .where(eq(EmailNotifications.id, input.id));
    }),
  CreateEmailPrefs: protectedProcedure
    .input(CreateEmailNotificationsSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(EmailNotifications).values(input);
    }),
  GetAllEmailPrefs: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.EmailNotifications.findMany();
  }),
} satisfies TRPCRouterRecord;
