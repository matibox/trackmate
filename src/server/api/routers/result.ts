import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { resultsSortingOptions } from '../../../constants/constants';
import { hasRole } from '../../../utils/helpers';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';

export const resultRouter = createTRPCRouter({
  post: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        qualiPosition: z.number(),
        racePosition: z.number(),
        notes: z.string().optional(),
        eventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, ...fields } = input;
      return await ctx.prisma.$transaction(async tx => {
        const result = await tx.result.create({
          data: {
            ...fields,
            event: { connect: { id: eventId } },
            team: hasRole(ctx.session, 'manager')
              ? { connect: { managerId: ctx.session.user.id } }
              : { connect: { id: ctx.session.user.teamId ?? undefined } },
            author: { connect: { id: ctx.session.user.id } },
          },
          include: { team: { select: { managerId: true } } },
        });
        return await tx.newResultNotification.create({
          data: {
            message: 'New result has been posted',
            receiver: {
              connect: { id: result.team.managerId },
            },
            result: {
              connect: { id: result.id },
            },
          },
        });
      });
    }),
  getResultPage: multiRoleProcedure(['manager', 'socialMedia'])
    .input(
      z.object({
        firstDay: z.date(),
        lastDay: z.date(),
        teamId: z.string().optional(),
        orderBy: z.object({
          by: z.enum(resultsSortingOptions),
          order: z.enum(['asc', 'desc']),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const { firstDay, lastDay, teamId, orderBy } = input;

      if (!teamId) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
        });
      }

      const { by, order } = orderBy;
      const orderField =
        by === 'createdAt'
          ? { createdAt: order }
          : by === 'eventDate'
          ? { event: { date: order } }
          : { racePosition: order };

      return await ctx.prisma.result.findMany({
        where: {
          teamId,
          event: {
            date: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        },
        include: {
          event: {
            include: {
              championship: { select: { name: true } },
              drivers: { select: { id: true, name: true } },
            },
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: orderField,
      });
    }),
});
