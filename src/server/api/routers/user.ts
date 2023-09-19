import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  byId: protectedProcedure
    .input(
      z.object({
        memberIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { memberIds } = input;
      return await ctx.prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: {
          profile: { select: { country: true } },
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      });
    }),
});
