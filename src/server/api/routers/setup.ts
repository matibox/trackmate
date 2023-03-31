import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const setupRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        data: z.object({}).passthrough(),
        shareWithTeam: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: setupData, shareWithTeam } = input;

      if (shareWithTeam && !ctx.session.user.teamId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have to be in a team',
        });
      }

      return await ctx.prisma.setup.create({
        data: {
          data: setupData,
          author: { connect: { id: ctx.session.user.id } },
          team: shareWithTeam
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              { connect: { id: ctx.session.user.teamId! } }
            : undefined,
        },
      });
    }),
});
