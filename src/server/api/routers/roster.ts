import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const rosterRouter = createTRPCRouter({
  drivers: protectedProcedure
    .input(z.object({ rosterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { rosterId } = input;

      const roster = await ctx.prisma.roster.findUnique({
        where: { id: rosterId },
        select: {
          members: {
            where: { role: { equals: 'driver' } },
            select: {
              user: {
                select: {
                  profile: { select: { country: true } },
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!roster) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "This roster doesn't have members",
        });
      }

      return roster.members;
    }),
});
