import { createTRPCRouter, protectedProcedure } from '../trpc';
import { stepTwoSingleSchema } from '~/core/dashboard/calendar/new-event/components/StepTwoSingle';
import { stepThreeSingleSchema } from '~/core/dashboard/calendar/new-event/components/StepThreeSingle';
import { stepFourSingleSchema } from '~/core/dashboard/calendar/new-event/components/StepFourSingle';
import { type ReplaceAll } from '~/lib/utils';
import { z } from 'zod';
import { getSessionTimespan } from '../utils/utils';

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.discriminatedUnion('eventType', [
        z.object({
          eventType: z.literal('single'),
          stepTwo: stepTwoSingleSchema,
          stepThree: stepThreeSingleSchema,
          stepFour: stepFourSingleSchema,
        }),
        z.object({
          eventType: z.literal('championship'),
        }),
      ])
    )
    .mutation(async ({ ctx, input }) => {
      const { eventType } = input;

      if (eventType === 'single') {
        const {
          stepTwo: { game, name, car, track, date },
          stepThree: { rosterId },
          stepFour: { sessions },
        } = input;

        const event = await ctx.prisma.event.create({
          data: {
            game: game.replaceAll(' ', '_') as ReplaceAll<
              typeof game,
              ' ',
              '_'
            >,
            name,
            car,
            track,
            roster: { connect: { id: rosterId } },
            // sessions: {
            //   createMany: {
            //     data: sessions.map(session => ({
            //       ...getSessionTimespan({ session, raceDate: date }),
            //     })),
            //   },
            // },
          },
          include: { sessions: true },
        });

        // super annoying...
        // https://github.com/prisma/prisma/issues/5455
        // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#create-multiple-records-and-multiple-related-records
        for (const session of sessions) {
          const ids =
            'driverIds' in session
              ? session.driverIds
              : 'driverId' in session
              ? [session.driverId]
              : [];
          if (ids.length === 0) continue;

          await ctx.prisma.eventSession.create({
            data: {
              ...getSessionTimespan({ session, raceDate: date }),
              type: session.type,
              event: { connect: { id: event.id } },
              drivers: { connect: ids.map(id => ({ id })) },
            },
          });
        }
      }
    }),
  getCalendarData: protectedProcedure
    .input(z.object({ from: z.date(), to: z.date() }))
    .query(async ({ ctx, input }) => {
      const { from, to } = input;
      return await ctx.prisma.eventSession.findMany({
        where: {
          event: {
            roster: { members: { some: { userId: ctx.session.user.id } } },
          },
          start: { gte: from, lte: to },
        },
        select: { start: true },
      });
    }),
  fromTo: protectedProcedure
    .input(z.object({ from: z.date(), to: z.date() }))
    .query(async ({ ctx, input }) => {
      const { from, to } = input;

      return await ctx.prisma.eventSession.findMany({
        where: {
          event: {
            roster: { members: { some: { userId: ctx.session.user.id } } },
          },
          start: { gte: from, lte: to },
        },
        orderBy: { start: 'asc' },
        select: {
          event: {
            select: {
              id: true,
              name: true,
              track: true,
              car: true,
              sessions: {
                orderBy: { start: 'asc' },
                select: {
                  id: true,
                  type: true,
                  start: true,
                  end: true,
                  drivers: {
                    select: {
                      id: true,
                      image: true,
                      firstName: true,
                      lastName: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
          id: true,
          start: true,
        },
      });
    }),
});
