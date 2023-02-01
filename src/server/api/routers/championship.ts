import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import { hasRole } from '../../../utils/helpers';
import { createTRPCRouter, driverProcedure, protectedProcedure } from '../trpc';

export const championshipRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ max: z.number().min(0).optional().default(2) }))
    .query(async ({ ctx, input }) => {
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
            orderBy: { date: 'desc' },
            take: 1,
            include: {
              drivers: {
                select: { id: true, name: true },
              },
            },
          },
          drivers: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: input.max === 0 ? undefined : input.max,
        // TODO add championship start and end
        // ?^ maybe order by these dates
      });
    }),
  list: driverProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.championship.findMany({
      where: { drivers: { some: { id: ctx.session.user.id } } },
      select: {
        id: true,
        name: true,
        car: true,
        type: true,
      },
    });
  }),
  create: protectedProcedure
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
      const { name, organizer, link, car, type, teammates, managerId } = input;
      return await ctx.prisma.championship.create({
        data: {
          name,
          organizer,
          link,
          type,
          car,
          drivers: {
            connect: teammates?.map(teammate => ({ id: teammate.id })),
          },
          manager: managerId ? { connect: { id: managerId } } : undefined,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ championshipId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { championshipId } = input;
      return await ctx.prisma.championship.delete({
        where: { id: championshipId },
      });
    }),
});
