import { createTRPCRouter } from '~/server/api/trpc';
import { welcomeRouter } from './routers/welcome';
import { teamRouter } from './routers/team';
import { userRouter } from './routers/user';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  welcome: welcomeRouter,
  team: teamRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
