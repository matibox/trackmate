import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import { hasRole } from '../../../utils/helpers';
import {
  createTRPCRouter,
  driverProcedure,
  managerProcedure,
  protectedProcedure,
} from '../trpc';

const eventSchema = z.object({
  title: z.string().nullable(),
  date: z.date(),
  type: z.enum(eventTypes),
  car: z.string(),
  track: z.string(),
  duration: z.number(),
  drivers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullable(),
});

const editEventSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  date: z.date().optional(),
  type: z.enum(eventTypes).nullish(),
  car: z.string().optional(),
  track: z.string().optional(),
  duration: z.number().optional(),
  managerId: z.string().optional(),
  drivers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullish(),
});

export const eventRouter = createTRPCRouter({
  createChampionshipEvent: protectedProcedure
    .input(
      eventSchema.merge(
        z.object({
          championshipId: z.string(),
          managerId: z.string().optional(),
          teamId: z.string().nullable(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const { drivers, ...data } = input;
      return await ctx.prisma.event.create({
        data: {
          ...data,
          drivers: {
            connect:
              drivers && drivers.length > 0
                ? drivers.map(driver => ({ id: driver.id }))
                : {
                    id: ctx.session.user.id,
                  },
          },
        },
      });
    }),
  createOneOffEvent: protectedProcedure
    .input(eventSchema)
    .mutation(async ({ ctx, input }) => {
      const { drivers, type, ...data } = input;

      let managerId: string | undefined;

      if (hasRole(ctx.session, 'manager')) {
        managerId = ctx.session.user.id;
      } else if (ctx.session.user.teamId && type === 'endurance') {
        const team = await ctx.prisma.team.findUnique({
          where: { id: ctx.session.user.teamId },
          select: { managerId: true },
        });

        if (!team) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You need to join a team',
          });
        }

        managerId = team.managerId;
      }

      return await ctx.prisma.event.create({
        data: {
          ...data,
          type,
          drivers: {
            connect:
              drivers && drivers.length > 0
                ? drivers.map(driver => ({ id: driver.id }))
                : {
                    id: ctx.session.user.id,
                  },
          },
          manager: managerId ? { connect: { id: managerId } } : undefined,
          team: ctx.session.user.teamId
            ? { connect: { id: ctx.session.user.teamId } }
            : undefined,
        },
      });
    }),
  getDrivingEvents: driverProcedure
    .input(z.object({ firstDay: z.date(), lastDay: z.date() }))
    .query(async ({ ctx, input }) => {
      const { firstDay, lastDay } = input;
      return await ctx.prisma.event.findMany({
        where: {
          AND: [
            { drivers: { some: { id: ctx.session.user.id } } },
            {
              date: {
                gte: firstDay,
                lt: dayjs(lastDay).add(1, 'day').toDate(),
              },
            },
          ],
        },
        include: {
          drivers: { select: { id: true, name: true, teamId: true } },
          championship: { select: { organizer: true, name: true } },
          result: true,
        },
        orderBy: { date: 'asc' },
      });
    }),
  getManagingEvents: managerProcedure
    .input(z.object({ firstDay: z.date(), lastDay: z.date() }))
    .query(async ({ ctx, input }) => {
      const { firstDay, lastDay } = input;
      return await ctx.prisma.event.findMany({
        where: {
          AND: [
            { managerId: ctx.session.user.id },
            {
              date: {
                gte: firstDay,
                lt: dayjs(lastDay).add(1, 'day').toDate(),
              },
            },
          ],
        },
        include: {
          drivers: { select: { id: true, name: true, teamId: true } },
          championship: { select: { organizer: true, name: true } },
          result: true,
        },
        orderBy: { date: 'asc' },
      });
    }),
  getTeamEvents: protectedProcedure
    .input(z.object({ firstDay: z.date(), lastDay: z.date() }))
    .query(async ({ ctx, input }) => {
      const { firstDay, lastDay } = input;

      const driverWhereClause = {
        drivers: { some: { id: { equals: ctx.session.user.id } } },
      };
      const managerWhereClause = { managerId: ctx.session.user.id };
      const socialWhereClause = { socialMediaId: ctx.session.user.id };
      const team = await ctx.prisma.team.findFirst({
        where: hasRole(ctx.session, ['driver', 'manager'])
          ? { OR: [driverWhereClause, managerWhereClause] }
          : hasRole(ctx.session, 'driver')
          ? driverWhereClause
          : hasRole(ctx.session, 'manager')
          ? managerWhereClause
          : socialWhereClause,
      });

      if (!team) return [];

      return await ctx.prisma.event.findMany({
        where: {
          AND: {
            drivers: {
              every: {
                AND: {
                  team: hasRole(ctx.session, 'driver')
                    ? {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        id: ctx.session.user.teamId!,
                      }
                    : hasRole(ctx.session, 'manager')
                    ? {
                        managerId: ctx.session.user.id,
                      }
                    : {
                        socialMediaId: ctx.session.user.id,
                      },
                  NOT: {
                    id: ctx.session.user.id,
                  },
                },
              },
            },
            date: {
              gte: firstDay,
              lt: dayjs(lastDay).add(1, 'day').toDate(),
            },
            NOT: [
              {
                manager: { id: ctx.session.user.id },
              },
            ],
          },
        },
        include: {
          drivers: { select: { id: true, name: true, teamId: true } },
          championship: { select: { organizer: true, name: true } },
          result: true,
        },
        orderBy: { date: 'asc' },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { eventId } = input;
      return await ctx.prisma.$transaction(async tx => {
        await tx.event.update({
          where: { id: eventId },
          data: {
            setups: {
              deleteMany: {},
            },
          },
        });

        await tx.event.delete({
          where: { id: eventId },
        });
      });
    }),
  edit: protectedProcedure
    .input(editEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, drivers, type, ...data } = input;
      return await ctx.prisma.event.update({
        where: { id },
        data: {
          ...data,
          type: type ? type : 'sprint',
          drivers: {
            set: drivers?.map(driver => ({
              id: driver.id,
            })),
          },
        },
      });
    }),
  setups: protectedProcedure
    .input(z.object({ eventId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { eventId } = input;
      return await ctx.prisma.setup.findMany({
        where: { events: { some: { event: { id: eventId } } } },
        include: {
          author: { select: { id: true, name: true } },
          events: { where: { eventId }, select: { isActive: true } },
          downloads: {
            where: { user: { id: ctx.session.user.id } },
            orderBy: { downloadedAt: 'desc' },
            take: 1,
          },
          feedback: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }),
  single: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { eventId } = input;
      return await ctx.prisma.$transaction(async tx => {
        const event = await tx.event.findUnique({
          where: { id: eventId },
          include: {
            drivers: {
              select: {
                id: true,
                name: true,
                teamId: true,
                image: true,
                team: {
                  select: { id: true, name: true },
                },
              },
            },
            manager: { select: { id: true, name: true } },
            championship: { select: { id: true, name: true, organizer: true } },
            result: true,
          },
        });

        if (!event) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Event not found',
          });
        }

        const eventSetups = await tx.setup.findMany({
          where: { events: { some: { event: { id: event.id } } } },
          select: {
            id: true,
            name: true,
            car: true,
            track: true,
            createdAt: true,
            updatedAt: true,
            author: { select: { id: true, name: true } },
            events: {
              where: { eventId: event.id },
              select: { isActive: true },
            },
            downloads: {
              where: { user: { id: ctx.session.user.id } },
              orderBy: { downloadedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { updatedAt: 'desc' },
        });

        return {
          ...event,
          setups: eventSetups,
        };
      });
    }),
  roster: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { eventId } = input;
      const event = await ctx.prisma.event.findUnique({
        where: { id: eventId },
        include: { drivers: { select: { id: true } } },
      });
      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }
      if (event.championshipId) {
        const foundChampionship = await ctx.prisma.championship.findUnique({
          where: { id: event.championshipId },
          select: {
            drivers: {
              where: {
                id: {
                  notIn: [
                    ctx.session.user.id,
                    ...event.drivers.map(driver => driver.id),
                  ],
                },
              },
              select: {
                id: true,
                name: true,
                teamId: true,
                image: true,
                team: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        });

        if (!foundChampionship) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Championship not found',
          });
        }

        return foundChampionship.drivers;
      }

      const team = await ctx.prisma.team.findUnique({
        where: { id: ctx.session.user.teamId ?? undefined },
        select: {
          drivers: {
            where: {
              id: {
                notIn: [
                  ctx.session.user.id,
                  ...event.drivers.map(driver => driver.id),
                ],
              },
            },
            select: {
              id: true,
              name: true,
              teamId: true,
              image: true,
              team: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' });
      }

      return team.drivers;
    }),
});
