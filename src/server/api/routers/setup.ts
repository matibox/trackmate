import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { decryptString } from '../utils/utils';

export const setupRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(z.object({ setupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { setupId } = input;
      return await ctx.prisma.setup.delete({ where: { id: setupId } });
    }),
  decrypt: protectedProcedure
    .input(z.object({ setupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { setupId } = input;
      const setup = await ctx.prisma.setup.findUnique({
        where: { id: setupId },
        select: { data: true },
      });

      if (!setup) {
        throw new TRPCError({
          message: 'No setup found.',
          code: 'NOT_FOUND',
        });
      }

      return decryptString(setup.data);
    }),
});
