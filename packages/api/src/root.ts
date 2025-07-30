import { authRouter } from "./router/auth";
import { CategoryRouter } from "./router/categories";
import { FacilityRouter } from "./router/facilities";
import { ReservationRouter } from "./router/reservations";
import { UserRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: UserRouter,
  category: CategoryRouter,
  reservation: ReservationRouter,
  facility: FacilityRouter,
});

export type AppRouter = typeof appRouter;
