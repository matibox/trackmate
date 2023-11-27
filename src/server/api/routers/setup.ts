import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const setupRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(z.object({ setupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { setupId } = input;
      return await ctx.prisma.setup.delete({ where: { id: setupId } });
    }),
});
