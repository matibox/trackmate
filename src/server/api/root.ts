import { createTRPCRouter } from './trpc';
import { roleRouter } from './routers/role';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  roles: roleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
