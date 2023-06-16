import { z } from 'zod';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';
import { addStintSchema } from '~/features/event/popups/AddStint';

export const stintRouter = createTRPCRouter({
  add: multiRoleProcedure(['driver', 'manager'])
    .input(addStintSchema.extend({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { eventId, driver, ...data } = input;
      return await ctx.prisma.stint.create({
        data: {
          ...data,
          event: { connect: { id: eventId } },
          driver: { connect: { id: driver.id } },
        },
      });
    }),
  delete: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ stintId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { stintId } = input;
      return await ctx.prisma.stint.delete({ where: { id: stintId } });
    }),
});
