import { createTRPCRouter, protectedProcedure } from '../trpc';
import { teams, usersToTeams } from '~/server/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { newTeamSchema } from '~/app/(dashboard)/teams/new/_components/formSchema';

export const teamRouter = createTRPCRouter({
  // CREATE
  create: protectedProcedure
    .input(newTeamSchema)
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      const createdTeam = await ctx.db
        .insert(teams)
        .values({ name })
        .returning({ id: teams.id });

      await ctx.db
        .insert(usersToTeams)
        .values({ teamId: createdTeam[0].id, userId: ctx.session.user.id });

      return createdTeam[0].id;
    }),

  // READ
  ofUser: protectedProcedure.query(async ({ ctx }) => {
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
