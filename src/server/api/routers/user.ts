import { profiles, teams, usersToTeams } from '~/server/db/schema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { eq, inArray, sql } from 'drizzle-orm';

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

    const teamIds = foundTeams.map(team => team.id);

    const memberCounts = await ctx.db
      .select({
        teamId: usersToTeams.teamId,
        count: sql<number>`COUNT(${usersToTeams.userId})`.as('count'),
      })
      .from(usersToTeams)
      .where(inArray(usersToTeams.teamId, teamIds))
      .groupBy(usersToTeams.teamId);

    const result = foundTeams.map(team => ({
      ...team,
      memberCount: memberCounts.find(t => t.teamId === team.id)?.count ?? 0,
    }));

    return result;
  }),
});
