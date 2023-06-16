import { z } from 'zod';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';
import { addStintSchema } from '~/features/event/popups/AddStint';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';

export const stintRouter = createTRPCRouter({
  add: multiRoleProcedure(['driver', 'manager'])
    .input(
      addStintSchema.extend({
        eventId: z.string(),
        nextStintId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, driver, nextStintId, ...data } = input;

      const stint = await ctx.prisma.stint.create({
        data: {
          ...data,
          event: { connect: { id: eventId } },
          driver: { connect: { id: driver.id } },
        },
      });

      if (nextStintId) {
        await ctx.prisma.$transaction(async tx => {
          const nextStint = await tx.stint.findUnique({
            where: { id: nextStintId },
          });

          if (!nextStint) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Stint not found',
            });
          }

          const getMinutes = (date: Date) => {
            const [hours, minutes] = dayjs(date)
              .format('HH:mm')
              .split(':')
              .map(Number) as [number, number];
            return minutes + hours * 60;
          };

          const getDuration = () => {
            const { duration, estimatedEnd, start } = nextStint;
            if (duration) return duration;

            return getMinutes(estimatedEnd) - getMinutes(start);
          };

          await tx.stint.update({
            where: { id: nextStint.id },
            data: {
              start: stint.estimatedEnd,
              estimatedEnd: dayjs(stint.start)
                .add(getDuration(), 'minutes')
                .toDate(),
            },
          });
        });
      }
    }),
  delete: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ stintId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { stintId } = input;
      return await ctx.prisma.stint.delete({ where: { id: stintId } });
    }),
});
