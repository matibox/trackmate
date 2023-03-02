import { createTRPCRouter, protectedProcedure } from '../trpc';

export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.$transaction([
      ctx.prisma.newResultNotification.findMany({
        where: { receiver: { id: ctx.session.user.id } },
        include: { result: { select: { author: { select: { name: true } } } } },
      }),
    ]);

    const isEmpty = data.every(notifGroup => notifGroup.length === 0);
    const [newResultNotifs] = data;

    return {
      notifGroups: {
        newResultNotifs,
      },
      isEmpty,
    };
  }),
});
