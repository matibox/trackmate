import { TRPCError } from '@trpc/server';
import { z } from 'zod';
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
      return await ctx.prisma.result.create({
        data: {
          ...fields,
          event: { connect: { id: eventId } },
          team: hasRole(ctx.session, 'manager')
            ? { connect: { managerId: ctx.session.user.id } }
            : { connect: { id: ctx.session.user.teamId ?? undefined } },
          author: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  getResultPage: multiRoleProcedure(['manager', 'socialMedia'])
    .input(
      z.object({
        firstDay: z.date(),
        lastDay: z.date(),
        teamId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { firstDay, lastDay, teamId } = input;

      if (!teamId) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
        });
      }

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
        orderBy: {
          event: {
            date: 'asc',
          },
        },
      });
    }),
});
