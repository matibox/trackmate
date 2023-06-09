import { z } from 'zod';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';

export const stintRouter = createTRPCRouter({
  add: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        eventId: z.string(),
        start: z.date(),
        estimatedEnd: z.date(),
        duration: z.number(),
        driverId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, driverId, ...data } = input;
      return await ctx.prisma.stint.create({
        data: {
          ...data,
          event: { connect: { id: eventId } },
          driver: { connect: { id: driverId } },
        },
      });
    }),
});
