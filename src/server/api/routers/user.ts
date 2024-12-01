import { profiles } from '~/server/db/schema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { eq } from 'drizzle-orm';

export const userRouter = createTRPCRouter({
  // READ
  profile: protectedProcedure.query(async ({ ctx }) => {
    const foundProfiles = await ctx.db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, ctx.session.user.id));

    return foundProfiles[0];
  }),
});
