import { z } from 'zod';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';

const setupSchema = z.object({
  data: z.object({}).passthrough(),
  name: z.string(),
  car: z.string(),
  track: z.string(),
});

export const setupRouter = createTRPCRouter({
  upload: multiRoleProcedure(['driver', 'manager'])
    .input(setupSchema)
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
      include: { author: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }),
  edit: multiRoleProcedure(['driver', 'manager'])
    .input(setupSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...values } = input;
      return await ctx.prisma.setup.update({
        where: { id },
        data: { ...values },
      });
    }),
});
