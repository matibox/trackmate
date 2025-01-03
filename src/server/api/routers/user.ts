import { profiles, teams, usersToTeams } from '~/server/db/schema';
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
  teams: protectedProcedure.query(async ({ ctx }) => {
    const foundTeams = await ctx.db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
      .where(eq(usersToTeams.userId, ctx.session.user.id));

    return foundTeams;
  }),
});
