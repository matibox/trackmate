import { profiles, teams, users, usersToTeams } from '~/server/db/schema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { and, eq, not } from 'drizzle-orm';
import { z } from 'zod';
import { games } from '~/lib/constants';

export const userRouter = createTRPCRouter({
  // READ
  byTeamAndGame: protectedProcedure
    .input(z.object({ teamId: z.number(), game: z.enum(games) }))
    .query(async ({ ctx, input }) => {
      const { teamId, game } = input;

      const drivers = await ctx.db
        .select({
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          country: profiles.country,
        })
        .from(users)
        .innerJoin(profiles, eq(users.id, profiles.userId))
        .innerJoin(usersToTeams, eq(users.id, usersToTeams.userId))
        .innerJoin(teams, eq(usersToTeams.teamId, teams.id))

        //TODO add games to profile

        .where(
          and(eq(teams.id, teamId), not(eq(users.id, ctx.session.user.id)))
        );

      console.log(drivers);

      return drivers;
    }),
});
