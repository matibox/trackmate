import { z } from 'zod';
import { roles } from '../../../constants/constants';

import { createTRPCRouter, protectedProcedure } from '../trpc';

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
});
