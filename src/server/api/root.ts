import { createTRPCRouter } from './trpc';
import { userRouter } from './routers/user';
import { teamRouter } from './routers/team';
import { championshipRouter } from './routers/championship';
import { eventRouter } from './routers/event';
import { resultRouter } from './routers/result';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  team: teamRouter,
  championship: championshipRouter,
  event: eventRouter,
  result: resultRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
