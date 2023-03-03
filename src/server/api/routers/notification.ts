import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { notificationGroups } from '../../../constants/constants';

export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.$transaction([
      ctx.prisma.newResultNotification.findMany({
        where: { receiver: { id: ctx.session.user.id } },
        include: { result: { select: { author: { select: { name: true } } } } },
      }),
    ]);

    const isEmpty = data.every(notifGroup => notifGroup.length === 0);
    const [newResultNotification] = data;

    const returnObj = {
      notifGroups: {
        newResultNotification,
      },
      isEmpty,
    } satisfies {
      notifGroups: Record<(typeof notificationGroups)[number], unknown>;
      isEmpty: boolean;
    };

    return returnObj;
  }),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string(), type: z.enum(notificationGroups) }))
    .mutation(async ({ ctx, input }) => {
      const { id, type } = input;
      return await ctx.prisma[type].update({
        where: { id },
        data: { read: true },
      });
    }),
});
