import { createTRPCRouter, protectedProcedure } from '../trpc';
import { step2SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step2Single';
import { step3SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step3Single';
import { step4SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step4Single';
import { timeStringToDate, type ReplaceAll } from '~/lib/utils';
import { z } from 'zod';
import { getSessionTimespan } from '../utils/utils';

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.discriminatedUnion('eventType', [
        z.object({
          eventType: z.literal('single'),
          stepTwo: step2SingleSchema,
          stepThree: step3SingleSchema,
          stepFour: step4SingleSchema,
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

          await ctx.prisma.eventSession.create({
            data: {
              ...getSessionTimespan({ session, raceDate: date }),
              type: session.type,
              event: { connect: { id: event.id } },
              drivers:
                ids.length === 0
                  ? undefined
                  : { connect: ids.map(id => ({ id })) },
              ...(session.type !== 'briefing' && session.serverInformation
                ? {
                    inGameTime: session.serverInformation.inGameTime
                      ? timeStringToDate(
                          session.serverInformation.inGameTime
                        ).toDate()
                      : undefined,
                    serverName: session.serverInformation.serverName,
                    serverPassword: session.serverInformation.serverPassword,
                  }
                : {}),
              ...((session.type === 'qualifying' || session.type === 'race') &&
              session.weather
                ? {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    rainLevel: parseFloat(session.weather.rainLevel!),
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    cloudLevel: parseFloat(session.weather.cloudLevel!),
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    randomness: parseInt(session.weather.randomness!),
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    temperature: parseInt(session.weather.ambientTemp!),
                  }
                : {}),
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
                  inGameTime: true,
                  serverName: true,
                  serverPassword: true,
                  cloudLevel: true,
                  rainLevel: true,
                  randomness: true,
                  temperature: true,
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
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      return await ctx.prisma.event.delete({ where: { id } });
    }),
});
