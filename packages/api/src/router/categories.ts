import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, like } from "@local/db";
import { Category } from "@local/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const CategoryRouter = {
  byFacility: protectedProcedure
    .input(z.object({ facilityId: z.number(), name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Category.findFirst({
        where: and(
          eq(Category.facilityId, input.facilityId),
          like(Category.name, input.name),
        ),
      });
    }),
} satisfies TRPCRouterRecord;
