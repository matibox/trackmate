import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { notificationGroups } from '../../../constants/constants';
import { type NewResultNotification } from '@prisma/client';

export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const whereClause = { where: { receiver: { id: ctx.session.user.id } } };
    const data = await ctx.prisma.$transaction([
      ctx.prisma.newResultNotification.findMany(whereClause),
      ctx.prisma.newChampResultNotification.findMany(whereClause),
      ctx.prisma.feedbackRequestNotification.findMany(whereClause),
    ]);

    const isEmpty = data.every(notifGroup => notifGroup.length === 0);
    const isAllRead = data.every(notifGroup =>
      // ? this is a bit sketchy
      (notifGroup as NewResultNotification[]).every(notif => notif.read)
    );
    const [
      newResultNotification,
      newChampResultNotification,
      feedbackRequestNotification,
    ] = data;

    const returnObj = {
      notifGroups: {
        newResultNotification,
        newChampResultNotification,
        feedbackRequestNotification,
      },
      isEmpty,
      isAllRead,
    } satisfies {
      notifGroups: Record<(typeof notificationGroups)[number], unknown>;
      isEmpty: boolean;
      isAllRead: boolean;
    };

    return returnObj;
  }),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string(), type: z.enum(notificationGroups) }))
    .mutation(async ({ ctx, input }) => {
      const { id, type } = input;

      const updateClause = {
        where: { id },
        data: { read: true },
      };

      switch (type) {
        case 'newResultNotification':
          return await ctx.prisma.newResultNotification.update(updateClause);
        case 'newChampResultNotification':
          return await ctx.prisma.newChampResultNotification.update(
            updateClause
          );
      }
    }),
});
