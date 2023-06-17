import { z } from 'zod';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';
import { addStintSchema } from '~/features/event/popups/AddStint';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { finishStint } from '~/features/event/popups/FinishStint';
import { type Stint } from '@prisma/client';

const getMinutes = (date: Date) => {
  const [hours, minutes] = dayjs(date)
    .format('HH:mm')
    .split(':')
    .map(Number) as [number, number];
  return minutes + hours * 60;
};

const getStintDuration = (stint: Stint) => {
  const { duration, estimatedEnd, start } = stint;
  if (duration) return duration;

  return getMinutes(estimatedEnd) - getMinutes(start);
};

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

          await tx.stint.update({
            where: { id: nextStint.id },
            data: {
              start: stint.estimatedEnd,
              estimatedEnd: dayjs(stint.start)
                .add(getStintDuration(stint), 'minutes')
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
  finish: multiRoleProcedure(['driver', 'manager'])
    .input(finishStint.extend({ stintId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { stintId, duration } = input;

      const stint = await ctx.prisma.stint.update({
        where: { id: stintId },
        data: {
          duration,
          ended: true,
        },
      });

      const stints = await ctx.prisma.stint.findMany({
        where: { eventId: stint.eventId },
        orderBy: { start: 'asc' },
      });

      const i = stints.findIndex(s => s.id === stint.id);

      const stintsAfterFinishedStint = stints.slice(i);

      if (stintsAfterFinishedStint.length > 0) {
        await ctx.prisma.$transaction(
          stintsAfterFinishedStint.map(s => {
            const start = dayjs(stint.start)
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              .add(stint.duration!, 'minutes')
              .toDate();
            const duration = getStintDuration(s);
            const estimatedEnd = dayjs(start).add(duration, 'minutes').toDate();

            return ctx.prisma.stint.update({
              where: { id: s.id },
              data: {
                start,
                estimatedEnd,
              },
            });
          })
        );
      }

      return stint;
    }),
});
