import { z } from 'zod';
import { hasRole } from '../../../utils/helpers';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const resultRouter = createTRPCRouter({
  post: protectedProcedure
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
        },
      });
    }),
});
