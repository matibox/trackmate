import { createTRPCRouter, protectedProcedure } from '../trpc';
import { step2SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step2Single';
import { step3SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step3Single';
import { step4SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step4Single';
import { timeStringToDate, type ReplaceAll } from '~/lib/utils';
import { z } from 'zod';
import { encryptString, getSessionTimespan } from '../utils/utils';
import { games } from '~/lib/constants';
import dayjs from 'dayjs';

export const eventRouter = createTRPCRouter({
  createOrEdit: protectedProcedure
    .input(
      z
        .discriminatedUnion('eventType', [
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
        .and(
          z.object({
            eventId: z.string().optional(),
          })
        )
    )
    .mutation(async ({ ctx, input }) => {
      const { eventType, eventId } = input;

      if (eventType === 'single') {
        const {
          eventType,
          stepTwo: { game, name, car, track },
          stepThree: { rosterId },
          stepFour: { sessions },
        } = input;

        const event = await ctx.prisma.event.upsert({
          where: { id: eventId ?? '' },
          create: {
            type: eventType,
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
          update: {
            game: game.replaceAll(' ', '_') as ReplaceAll<
              typeof game,
              ' ',
              '_'
            >,
            name,
            car,
            track,
            roster: { connect: { id: rosterId } },
          },
          include: { sessions: true },
        });

        // if in edit mode
        if (eventId) {
          await ctx.prisma.eventSession.deleteMany({
            where: { eventId },
          });
        }
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

          console.log(
            dayjs(getSessionTimespan({ session }).start).format('DD/MM HH:mm')
          );

          await ctx.prisma.eventSession.create({
            data: {
              ...getSessionTimespan({ session }),
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

        return sessions[0]?.date;
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
              game: true,
              type: true,
              roster: {
                select: { id: true, team: { select: { name: true } } },
              },
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
  addAndAssignSetup: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        setupData: z.string(),
        eventId: z.string(),
        game: z.enum(games),
        car: z.string().nullable(),
        track: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, setupData, game, ...values } = input;
      const encryptedSetupData = encryptString(setupData);

      return await ctx.prisma.setup.create({
        data: {
          ...values,
          game: game.replaceAll(' ', '_') as ReplaceAll<typeof game, ' ', '_'>,
          data: encryptedSetupData,
          uploader: { connect: { id: ctx.session.user.id } },
          event: { connect: { id: eventId } },
        },
      });
    }),
  getSetups: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { eventId } = input;

      return await ctx.prisma.setup.findMany({
        where: { event: { id: eventId } },
        select: {
          id: true,
          name: true,
          uploadedAt: true,
          uploader: { select: { firstName: true, lastName: true } },
        },
      });
    }),
});
