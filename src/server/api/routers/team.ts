import { z } from 'zod';
import { hasRole } from '../../../utils/helpers';
import {
  createTRPCRouter,
  driverProcedure,
  managerProcedure,
  multiRoleProcedure,
  protectedProcedure,
} from '../trpc';

export const teamRouter = createTRPCRouter({
  getHasTeam: protectedProcedure.query(async ({ ctx }) => {
    const driverWhereClause = {
      drivers: { some: { id: { equals: ctx.session.user.id } } },
    };
    const managerWhereClause = { managerId: ctx.session.user.id };
    const socialWhereClause = { socialMediaId: ctx.session.user.id };
    return await ctx.prisma.team.findFirst({
      where: hasRole(ctx.session, ['driver', 'manager'])
        ? { OR: [driverWhereClause, managerWhereClause] }
        : hasRole(ctx.session, 'driver')
        ? driverWhereClause
        : hasRole(ctx.session, 'manager')
        ? managerWhereClause
        : socialWhereClause,
    });
  }),
  getDriveFor: driverProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findFirst({
      where: { id: ctx.session.user.teamId ?? undefined },
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
          where: {
            AND: [
              { type: 'endurance' },
              {
                date: {
                  gte: new Date(),
                },
              },
            ],
          },
          include: {
            drivers: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: 'asc' },
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
        socialMedia: {
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
        socialMedia: z.object({ id: z.string(), name: z.string() }).nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, drivers, socialMedia } = input;

      return await ctx.prisma.team.create({
        data: {
          name,
          drivers: {
            connect: drivers.map(driver => ({ id: driver.id })),
          },
          manager: { connect: { id: ctx.session.user.id } },
          socialMedia: socialMedia
            ? {
                connect: {
                  id: socialMedia.id,
                },
              }
            : undefined,
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
        socialMedia: z.object({ id: z.string(), name: z.string() }).nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, name, drivers, socialMedia } = input;
      return await ctx.prisma.team.update({
        where: { id: teamId },
        data: {
          name,
          drivers: { set: drivers?.map(driver => ({ id: driver.id })) },
          socialMedia: {
            disconnect: true,
            connect: socialMedia ? { id: socialMedia.id } : undefined,
          },
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
  getTeammatesOrDrivers: multiRoleProcedure(['driver', 'manager']).query(
    async ({ ctx }) => {
      const driverWhereClause = {
        team: { drivers: { some: { id: { equals: ctx.session.user.id } } } },
      };
      const managerWhereClause = {
        team: {
          managerId: ctx.session.user.id,
        },
      };
      return await ctx.prisma.user.findMany({
        where: hasRole(ctx.session, ['driver', 'manager'])
          ? { OR: [driverWhereClause, managerWhereClause] }
          : hasRole(ctx.session, 'driver')
          ? driverWhereClause
          : managerWhereClause,
        select: {
          id: true,
          name: true,
          teamId: true,
          image: true,
          team: {
            select: { id: true, name: true },
          },
        },
      });
    }
  ),
});
