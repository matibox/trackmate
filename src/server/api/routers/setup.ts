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
  byQuery: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ q: z.string(), eventId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { q, eventId } = input;
      return await ctx.prisma.setup.findMany({
        where: {
          AND: [
            { name: { contains: q.toLowerCase() } },
            { events: { none: { id: eventId } } },
            { author: { id: ctx.session.user.id } },
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
  delete: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      return await ctx.prisma.setup.delete({ where: { id } });
    }),
  toggleAssignment: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        setupId: z.string(),
        eventId: z.string().optional(),
        assign: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { setupId, eventId, assign } = input;
      return await ctx.prisma.setup.update({
        where: { id: setupId },
        data: {
          events: assign
            ? { connect: { id: eventId } }
            : { disconnect: { id: eventId } },
        },
      });
    }),
});
