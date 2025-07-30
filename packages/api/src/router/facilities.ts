import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@local/db";
import { Category, CreateFacilitySchema, Facility } from "@local/db/schema";
import { CategoryDescriptions } from "@local/validators/constants";

import { protectedProcedure, publicProcedure } from "../trpc";

export const FacilityRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Facility.findMany({
      with: {
        Category: true,
      },
    });
  }),
  allIds: publicProcedure.query(({ ctx }) => {
    return ctx.db.select({ id: Facility.id }).from(Facility);
  }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.db.query.Facility.findFirst({
        where: eq(Facility.id, input.id),
        with: {
          Category: true,
          Reservation: true,
        },
      });
    }),
  byBuilding: publicProcedure
    .input(z.object({ building: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.db.query.Facility.findMany({
        where: eq(Facility.building, input.building),
      });
    }),
  byBuildingName: publicProcedure
    .input(z.object({ building: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.db.query.Facility.findMany({
        where: eq(Facility.building, input.building),
      });
    }),
  new: protectedProcedure
    .input(CreateFacilitySchema)
    .mutation(async ({ ctx, input }) => {
      const [NewFacility] = await ctx.db
        .insert(Facility)
        .values(input)
        .returning({ id: Facility.id });

      let cat1Price = 0;
      let cat2Price = 0;
      let cat3Price = 0;
      const staffPrice = 0;
      if (input.category1) {
        cat1Price = input.category1;
      }
      if (input.category2) {
        cat2Price = input.category2;
      }
      if (input.category3) {
        cat3Price = input.category3;
      }

      return ctx.db.insert(Category).values([
        {
          facilityId: NewFacility?.id!,
          price: staffPrice,
          name: CategoryDescriptions.Staff.name,
          description: CategoryDescriptions.Staff.description,
        },
        {
          facilityId: NewFacility?.id!,
          price: cat1Price,
          name: CategoryDescriptions.Category1.name,
          description: CategoryDescriptions.Category1.description,
        },
        {
          facilityId: NewFacility?.id!,
          price: cat2Price,
          name: CategoryDescriptions.Category2.name,
          description: CategoryDescriptions.Category2.description,
        },
        {
          facilityId: NewFacility?.id!,
          price: cat3Price,
          name: CategoryDescriptions.Category3.name,
          description: CategoryDescriptions.Category3.description,
        },
      ]);
    }),
} satisfies TRPCRouterRecord;
