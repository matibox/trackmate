import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import { hasRole } from '../../../utils/helpers';
import {
  createTRPCRouter,
  driverProcedure,
  managerProcedure,
  multiRoleProcedure,
} from '../trpc';

export const championshipRouter = createTRPCRouter({
  get: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        max: z.number().min(0).optional().default(2),
        upcoming: z.boolean().optional().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { max, upcoming } = input;
      const driverWhereClause = {
        drivers: { some: { id: ctx.session.user.id } },
      };

      const managerWhereClause = {
        manager: { id: ctx.session.user.id },
      };

      return await ctx.prisma.championship.findMany({
        where: hasRole(ctx.session, ['driver', 'manager'])
          ? {
              OR: [driverWhereClause, managerWhereClause],
            }
          : hasRole(ctx.session, 'driver')
          ? driverWhereClause
          : managerWhereClause,
        include: {
          events: {
            where: upcoming ? { date: { gte: new Date() } } : undefined,
            orderBy: { date: 'asc' },
            take: upcoming ? 1 : undefined,
            include: {
              drivers: {
                select: { id: true, name: true },
              },
              result: true,
            },
          },
          drivers: {
            select: {
              id: true,
              name: true,
            },
          },
          result: true,
        },
        take: max === 0 ? undefined : max,
      });
    }),
  listDriverChamps: driverProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.championship.findMany({
      where: { drivers: { some: { id: ctx.session.user.id } } },
      include: {
        drivers: {
          select: { id: true, name: true },
        },
        team: { select: { id: true } },
      },
    });
  }),
  listManagingChamps: managerProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.championship.findMany({
      where: { managerId: ctx.session.user.id },
      include: {
        drivers: {
          select: { id: true, name: true },
        },
        team: { select: { id: true } },
      },
    });
  }),
  create: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        name: z.string(),
        organizer: z.string(),
        link: z.string(),
        car: z.string().nullable(),
        type: z.enum(eventTypes),
        teammates: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
            })
          )
          .optional(),
        managerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { type, teammates, managerId, ...data } = input;
      return await ctx.prisma.championship.create({
        data: {
          ...data,
          type,
          drivers: {
            connect: teammates?.map(teammate => ({ id: teammate.id })),
          },
          manager: managerId ? { connect: { id: managerId } } : undefined,
          team: type === 'endurance' ? { connect: { managerId } } : undefined,
        },
      });
    }),
  delete: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ championshipId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { championshipId } = input;
      return await ctx.prisma.championship.delete({
        where: { id: championshipId },
      });
    }),
});
