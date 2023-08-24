import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const teamRouter = createTRPCRouter({
  byQuery: publicProcedure
    .input(z.object({ q: z.string() }))
    .query(async ({ ctx, input }) => {
      const { q } = input;
      return await ctx.prisma.team.findMany({
        where: { name: { contains: q } },
      });
    }),
});
