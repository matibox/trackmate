import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { notificationGroups } from '../../../constants/constants';

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
      // ! this is sketchy
      // @ts-expect-error 2349
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      notifGroup.every(notif => notif.read)
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

      // @ts-expect-error 2349
      await ctx.prisma[type].update(updateClause);
    }),
});
