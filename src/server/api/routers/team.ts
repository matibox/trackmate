import { z } from 'zod';
import { createTRPCRouter, driverProcedure, managerProcedure } from '../trpc';

export const teamRouter = createTRPCRouter({
  getDriveFor: driverProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findFirst({
      where: { drivers: { some: { id: { equals: ctx.session.user.id } } } },
      include: {
        drivers: {
          select: {
            id: true,
            name: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
        events: {
          where: { type: 'endurance' },
          include: {
            drivers: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });
  }),
  getManagingFor: managerProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findUnique({
      where: {
        managerId: ctx.session.user.id,
      },
      include: {
        drivers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }),
  create: managerProcedure
    .input(
      z.object({
        name: z.string(),
        drivers: z.array(z.object({ id: z.string(), name: z.string() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, drivers } = input;

      return await ctx.prisma.team.create({
        data: {
          name,
          drivers: {
            connect: drivers.map(driver => ({ id: driver.id })),
          },
          manager: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  delete: managerProcedure
    .input(z.object({ teamId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.team.delete({ where: { id: input.teamId } });
    }),
  edit: managerProcedure
    .input(
      z.object({
        teamId: z.string().optional(),
        name: z.string().optional(),
        drivers: z
          .array(z.object({ id: z.string(), name: z.string() }))
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, name, drivers } = input;
      return await ctx.prisma.team.update({
        where: { id: teamId },
        data: {
          name,
          drivers: { set: drivers?.map(driver => ({ id: driver.id })) },
        },
      });
    }),
  removeDriver: managerProcedure
    .input(
      z.object({
        teamId: z.string().optional(),
        driverId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.team.update({
        where: { id: input.teamId },
        data: {
          drivers: {
            disconnect: { id: input.driverId },
          },
        },
      });
    }),
  getTeammates: driverProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany({
      where: { team: { drivers: { some: { id: ctx.session.user.id } } } },
      select: {
        id: true,
        name: true,
      },
    });
  }),
});