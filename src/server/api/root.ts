import { createTRPCRouter } from '~/server/api/trpc';
import { welcomeRouter } from './routers/welcome';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  welcome: welcomeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
