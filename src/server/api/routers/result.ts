import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { resultsSortingOptions } from '../../../constants/constants';
import { hasRole } from '../../../utils/helpers';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';

export const resultRouter = createTRPCRouter({
  post: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        qualiPosition: z.number().nullable(),
        racePosition: z.number().nullable(),
        notes: z.string().optional(),
        eventId: z.string(),
        DNF: z.boolean(),
        DSQ: z.boolean(),
        DNS: z.boolean(),
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
        // ? what if there is no team connected
        return await tx.newResultNotification.create({
          data: {
            message: `${ctx.session.user.name ?? 'driver'} posted a result`,
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
  postChampionship: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        position: z.number(),
        championshipId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { championshipId, ...fields } = input;
      return await ctx.prisma.$transaction(async tx => {
        const result = await tx.championshipResult.create({
          data: {
            ...fields,
            championship: { connect: { id: championshipId } },
            team: hasRole(ctx.session, 'manager')
              ? { connect: { managerId: ctx.session.user.id } }
              : { connect: { id: ctx.session.user.teamId ?? undefined } },
            author: { connect: { id: ctx.session.user.id } },
          },
          include: { team: { select: { managerId: true } } },
        });
        // ? what if there is no team connected
        return await tx.newChampResultNotification.create({
          data: {
            message: `${
              ctx.session.user.name ?? 'driver'
            } posted a championship result`,
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
});
