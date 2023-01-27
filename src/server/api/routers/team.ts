import { TRPCError } from '@trpc/server';
import { createTRPCRouter, driverProcedure, managerProcedure } from '../trpc';

export const teamRouter = createTRPCRouter({
  getDriveFor: driverProcedure.query(async ({ ctx }) => {
    const team = await ctx.prisma.team.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });

    if (!team) {
      return { notFound: true, team };
    }

    return { notFound: false, team };
  }),
  getManagingFor: managerProcedure.query(async ({ ctx }) => {
    const team = await ctx.prisma.team.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: "You don't manage any team",
      });
    }

    return team;
  }),
});
