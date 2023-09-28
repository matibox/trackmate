import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  byId: protectedProcedure
    .input(
      z.object({
        memberIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { memberIds } = input;
      return await ctx.prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: {
          profile: { select: { country: true } },
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      });
    }),
  isInTeamOrRoster: protectedProcedure.query(async ({ ctx }) => {
    const userTeams = await ctx.prisma.team.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
      select: { id: true },
    });

    const userRosters = await ctx.prisma.roster.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
      select: { id: true },
    });

    return {
      isInTeam: userTeams.length > 0,
      isInRoster: userTeams.length > 0 && userRosters.length > 0,
    };
  }),
});
