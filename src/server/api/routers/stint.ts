import { z } from 'zod';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';
import { addStintSchema } from '~/features/event/popups/AddStint';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { finishStintSchema } from '~/features/event/popups/FinishStint';
import { getStintDuration } from '~/utils/stints';

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
              estimatedEnd: dayjs(stint.estimatedEnd)
                .add(getStintDuration(nextStint), 'minutes')
                .toDate(),
            },
          });

          const stints = await tx.stint.findMany({
            where: { eventId: stint.eventId },
            orderBy: { start: 'asc' },
          });

          const i = stints.findIndex(s => s.id === nextStint.id);
          const stintsAfterAddedStint = stints.slice(i + 1);

          console.log(stintsAfterAddedStint);

          if (stintsAfterAddedStint.length > 0) {
            await ctx.prisma.$transaction(
              stintsAfterAddedStint.map(s => {
                const duration = getStintDuration(stint);

                return ctx.prisma.stint.update({
                  where: { id: s.id },
                  data: {
                    start: dayjs(s.start).add(duration, 'minutes').toDate(),
                    estimatedEnd: dayjs(s.estimatedEnd)
                      .add(duration, 'minutes')
                      .toDate(),
                  },
                });
              })
            );
          }
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
    .input(finishStintSchema.extend({ stintId: z.string().optional() }))
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
      const stintsAfterFinishedStint = stints.slice(i + 1);

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
