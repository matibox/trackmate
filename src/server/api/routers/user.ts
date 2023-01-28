import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { roles } from '../../../constants/constants';

import {
  createTRPCRouter,
  managerProcedure,
  protectedProcedure,
} from '../trpc';

export const userRouter = createTRPCRouter({
  assignRoles: protectedProcedure
    .input(z.array(z.enum(roles)))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          roles: {
            connectOrCreate: input.map(role => ({
              where: {
                name: role,
              },
              create: {
                name: role,
              },
            })),
          },
        },
      });
    }),
  getDrivers: managerProcedure
    .input(z.object({ q: z.string() }))
    .query(async ({ ctx, input }) => {
      const { q } = input;
      const drivers = await ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
        },
        where: { name: { contains: q.toLowerCase(), mode: 'insensitive' } },
      });

      if (!drivers) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No drivers found' });
      }

      return drivers;
    }),
});
