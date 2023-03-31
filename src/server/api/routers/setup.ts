import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const setupRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        data: z.object({}).passthrough(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: setupData } = input;

      return await ctx.prisma.setup.create({
        data: {
          data: setupData,
          author: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
