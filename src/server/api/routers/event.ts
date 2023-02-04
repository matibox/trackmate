import dayjs from 'dayjs';
import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import {
  createTRPCRouter,
  driverProcedure,
  managerProcedure,
  protectedProcedure,
} from '../trpc';

const createChampionshipSchema = z.object({
  title: z.string().nullable(),
  date: z.date(),
  type: z.enum(eventTypes),
  car: z.string(),
  track: z.string(),
  duration: z.number(),
  managerId: z.string().optional(),
  drivers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullable(),
});

export const eventRouter = createTRPCRouter({
  createChampionshipEvent: protectedProcedure
    .input(
      createChampionshipSchema.merge(
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
    .input(createChampionshipSchema)
    .mutation(async ({ ctx, input }) => {
      const { drivers, type, ...data } = input;

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
          teamId: ctx.session.user.teamId ?? undefined,
        },
      });
    }),
  getDrivingEvents: driverProcedure
    .input(z.object({ monthIndex: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.event.findMany({
        where: {
          AND: [
            { drivers: { some: { id: ctx.session.user.id } } },
            {
              date: {
                gte: new Date(dayjs().year(), input.monthIndex, 1),
                lte: new Date(
                  dayjs().year(),
                  input.monthIndex,
                  dayjs(
                    new Date(dayjs().year(), input.monthIndex)
                  ).daysInMonth()
                ),
              },
            },
          ],
        },
        include: {
          drivers: { select: { id: true, name: true } },
          championship: { select: { organizer: true, name: true } },
        },
      });
    }),
  getManagingEvents: managerProcedure
    .input(z.object({ monthIndex: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.event.findMany({
        where: {
          AND: [
            { managerId: ctx.session.user.id },
            {
              date: {
                gte: new Date(dayjs().year(), input.monthIndex, 1),
                lte: new Date(
                  dayjs().year(),
                  input.monthIndex,
                  dayjs(
                    new Date(dayjs().year(), input.monthIndex)
                  ).daysInMonth()
                ),
              },
            },
          ],
        },
        include: {
          drivers: { select: { id: true, name: true } },
          championship: { select: { organizer: true, name: true } },
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.event.delete({
        where: { id: input.eventId },
      });
    }),
});
