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
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.event.findMany({
      where: {
        sessions: { some: { drivers: { some: { id: ctx.session.user.id } } } },
      },
      include: {
        sessions: {
          include: {
            drivers: {
              select: {
                profile: { select: { country: true } },
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }),
});
