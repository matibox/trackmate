import { z } from 'zod';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';

export const setupRouter = createTRPCRouter({
  upload: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        data: z.object({}).passthrough(),
        name: z.string(),
        car: z.string(),
        track: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.setup.create({
        data: {
          ...input,
          author: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  getAll: multiRoleProcedure(['driver', 'manager']).query(async ({ ctx }) => {
    return await ctx.prisma.setup.findMany({
      where: {
        OR: [
          {
            events: {
              some: {
                drivers: {
                  some: {
                    id: ctx.session.user.id,
                  },
                },
              },
            },
          },
          {
            author: { id: ctx.session.user.id },
          },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }),
});
