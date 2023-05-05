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
  markAllAsRead: protectedProcedure.mutation(({ ctx }) => {
    async function markAsRead(group: (typeof notificationGroups)[number]) {
      // @ts-expect-error 2349
      await ctx.prisma[group].updateMany({ data: { read: true } });
    }

    notificationGroups.forEach(group => {
      void markAsRead(group);
    });
  }),
});
