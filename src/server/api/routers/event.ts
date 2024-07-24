import { createTRPCRouter, protectedProcedure } from '../trpc';
import { getSessionTimespan, replaceAll, timeStringToDate } from '~/lib/utils';
import { z } from 'zod';
import { encryptString } from '../utils/utils';
import { games } from '~/lib/constants';
import { newEventSchema } from '~/core/dashboard/calendar/new-event/NewEvent';
import { type sessionSchema } from '~/core/dashboard/calendar/new-event/SessionForm';
import { type PrismaClient } from '@prisma/client';

async function createEventSession(
  {
    sessions,
    eventId,
  }: {
    sessions: Array<z.infer<typeof sessionSchema>>;
    eventId: string;
  },
  db: PrismaClient
) {
  for (const session of sessions) {
    const { start, end } = getSessionTimespan({ session });
    const inGameTime =
      'inGameTime' in session && session.inGameTime
        ? timeStringToDate(session.inGameTime).toDate()
        : undefined;

    const driverIds =
      'driverIds' in session
        ? session.driverIds
        : 'driverId' in session
        ? [session.driverId]
        : [];

    await db.eventSession.create({
      data: {
        event: { connect: { id: eventId } },
        drivers:
          driverIds.length > 0
            ? { connect: driverIds.map(id => ({ id })) }
            : undefined,
        type: session.type,
        serverName: 'serverName' in session ? session.serverName : undefined,
        serverPassword:
          'serverPassword' in session ? session.serverPassword : undefined,
        start,
        end,
        inGameTime,
        rainLevel:
          'rainLevel' in session ? parseFloat(session.rainLevel!) : undefined,
        cloudLevel:
          'cloudLevel' in session ? parseFloat(session.cloudLevel!) : undefined,
        randomness:
          'randomness' in session ? parseInt(session.randomness!) : undefined,
        temperature:
          'temperature' in session ? parseInt(session.temperature!) : undefined,
      },
    });
  }
}

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(newEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, game, track, car, rosterId, sessions } = input;

      const event = await ctx.prisma.event.create({
        include: { sessions: true },
        data: {
          name,
          game: replaceAll(game, ' ', '_'),
          track,
          car,
          roster: { connect: { id: rosterId } },
        },
      });

      await createEventSession({ sessions, eventId: event.id }, ctx.prisma);

      return event;
    }),
  edit: protectedProcedure
    .input(newEventSchema.partial().extend({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { eventId, game, name, car, track, rosterId, sessions } = input;

      const event = await ctx.prisma.event.update({
        where: { id: eventId },
        include: { sessions: true },
        data: {
          game: game ? replaceAll(game, ' ', '_') : undefined,
          name,
          car,
          track,
          roster: { connect: { id: rosterId } },
        },
      });

      await ctx.prisma.eventSession.deleteMany({ where: { eventId } });

      if (!sessions) return event;

      await createEventSession({ sessions, eventId: event.id }, ctx.prisma);
      return event;
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
              roster: {
                select: {
                  id: true,
                  team: { select: { id: true, name: true } },
                },
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
          game: replaceAll(game, ' ', '_'),
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
