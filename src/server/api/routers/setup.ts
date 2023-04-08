import { z } from 'zod';
import { createTRPCRouter, multiRoleProcedure } from '../trpc';
import { decrypt, encrypt } from '../../utils/encrypt';
import { TRPCError } from '@trpc/server';

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
      const encryptedSetup = encrypt(input.data);
      await ctx.prisma.setup.create({
        data: {
          ...input,
          data: encryptedSetup,
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
                event: {
                  drivers: {
                    some: {
                      id: ctx.session.user.id,
                    },
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
      select: {
        id: true,
        name: true,
        car: true,
        track: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, name: true } },
      },
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
            { events: { none: { event: { id: eventId } } } },
            { author: { id: ctx.session.user.id } },
          ],
        },
        select: {
          id: true,
          name: true,
          car: true,
          track: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, name: true } },
          events: {
            where: { event: { id: eventId } },
            select: { isActive: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }),
  edit: multiRoleProcedure(['driver', 'manager'])
    .input(setupSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, data, ...values } = input;
      const encryptedSetup = encrypt(data);
      await ctx.prisma.setup.update({
        where: { id },
        data: { ...values, data: encryptedSetup },
      });
    }),
  delete: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      await ctx.prisma.setup.delete({ where: { id } });
    }),
  decryptData: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ setupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { setupId } = input;
      const setup = await ctx.prisma.setup.findUnique({
        where: { id: setupId },
        select: { data: true },
      });

      if (!setup) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Setup was not found',
        });
      }

      return decrypt(setup.data);
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
      await ctx.prisma.$transaction(async tx => {
        if (assign) {
          const eventWithActiveSetup = await tx.event.findFirst({
            where: {
              AND: [{ id: eventId }, { setups: { some: { isActive: true } } }],
            },
            select: { id: true },
          });

          let setIsActive = false;
          if (eventWithActiveSetup === null) setIsActive = true;

          return await tx.setup.update({
            where: { id: setupId },
            data: {
              events: {
                create: {
                  event: {
                    connect: {
                      id: eventId,
                    },
                  },
                  isActive: setIsActive,
                },
              },
            },
          });
        } else {
          const activeSetup = await tx.setup.findFirst({
            where: {
              AND: {
                events: { some: { event: { id: eventId }, isActive: true } },
              },
            },
            select: { id: true, name: true },
          });

          const otherEventSetups =
            activeSetup?.id === setupId
              ? await tx.setup.findMany({
                  where: {
                    events: { some: { event: { id: eventId } } },
                    id: { not: activeSetup.id },
                  },
                  select: { id: true, name: true },
                  take: 1,
                })
              : undefined;

          if (otherEventSetups && otherEventSetups.length > 0) {
            await tx.eventsOnSetups.update({
              where: {
                eventId_setupId: {
                  eventId: eventId as string,
                  setupId: otherEventSetups[0]?.id as string,
                },
              },
              data: { isActive: true },
            });
          }

          return await tx.setup.update({
            where: { id: setupId },
            data: {
              events: {
                delete: {
                  eventId_setupId: {
                    eventId: eventId as string,
                    setupId,
                  },
                },
              },
            },
          });
        }
      });
    }),
  toggleIsActive: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        setupId: z.string(),
        eventId: z.string(),
        setAsActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { setupId, eventId, setAsActive } = input;
      await ctx.prisma.setup.update({
        where: { id: setupId },
        data: {
          events: {
            update: {
              where: {
                eventId_setupId: {
                  eventId,
                  setupId,
                },
              },
              data: {
                isActive: setAsActive,
              },
            },
          },
        },
      });
    }),
});
