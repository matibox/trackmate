import { profiles, teams, usersToTeams } from '~/server/db/schema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { count, eq } from 'drizzle-orm';

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

    return Promise.all(
      foundTeams.map(async team => {
        const res = await ctx.db
          .select({ count: count() })
          .from(usersToTeams)
          .where(eq(usersToTeams.teamId, team.id));

        return { ...team, memberCount: res[0].count };
      })
    );
  }),
});
