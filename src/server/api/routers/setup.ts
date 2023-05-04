import { z } from 'zod';
import { createTRPCRouter, driverProcedure, multiRoleProcedure } from '../trpc';
import { decrypt, encrypt } from '../../utils/encrypt';
import { TRPCError } from '@trpc/server';

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
      const encryptedSetup = encrypt(input.data);
      await ctx.prisma.setup.create({
        data: {
          ...input,
          data: encryptedSetup,
          author: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  getAll: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        filter: z.enum(['all', 'your', 'shared']).default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { filter } = input;

      const sharedSetupsQuery = {
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
      };

      const yourSetupsQuery = {
        author: { id: ctx.session.user.id },
      };

      return await ctx.prisma.setup.findMany({
        where:
          filter === 'all'
            ? {
                OR: [sharedSetupsQuery, yourSetupsQuery],
              }
            : filter === 'your'
            ? yourSetupsQuery
            : sharedSetupsQuery,
        select: {
          id: true,
          name: true,
          car: true,
          track: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, name: true } },
          events: { select: { isActive: true } },
          downloads: {
            where: { user: { id: ctx.session.user.id } },
            orderBy: { downloadedAt: 'desc' },
            take: 1,
          },
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
            {
              OR: [
                { name: { contains: q.toLowerCase() } },
                { car: { contains: q.toLowerCase() } },
                { track: { contains: q.toLowerCase() } },
                { author: { name: { contains: q.toLowerCase() } } },
              ],
            },
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
          downloads: {
            where: { user: { id: ctx.session.user.id } },
            orderBy: { downloadedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }),
  edit: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        id: z.string(),
        data: z.object({}).passthrough().optional(),
        name: z.string().optional(),
        car: z.string().optional(),
        track: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data, ...values } = input;
      await ctx.prisma.setup.update({
        where: { id },
        data: { ...values, data: data ? encrypt(data) : undefined },
      });
    }),
  delete: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      await ctx.prisma.$transaction(async tx => {
        await tx.setup.update({
          where: { id },
          data: {
            events: {
              deleteMany: {},
            },
          },
        });

        await tx.setup.delete({ where: { id } });
      });
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
  logDownload: multiRoleProcedure(['driver', 'manager'])
    .input(z.object({ setupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { setupId } = input;
      await ctx.prisma.download.create({
        data: {
          setup: { connect: { id: setupId } },
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  toggleAssignment: multiRoleProcedure(['driver', 'manager'])
    .input(
      z.object({
        setupId: z.string(),
        eventId: z.string(),
        assign: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { setupId, eventId, assign } = input;
      await ctx.prisma.$transaction(async tx => {
        if (assign) {
          await tx.setup.update({
            where: { id: setupId },
            data: {
              events: {
                create: {
                  event: {
                    connect: { id: eventId },
                  },
                  isActive: false,
                },
              },
            },
          });
        } else {
          await tx.setup.update({
            where: { id: setupId },
            data: {
              events: {
                delete: {
                  eventId_setupId: {
                    eventId: eventId,
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
      await ctx.prisma.eventsOnSetups.update({
        where: { eventId_setupId: { eventId, setupId } },
        data: { isActive: setAsActive },
      });
    }),
  requestFeedback: driverProcedure
    .input(
      z.object({
        setup: z.object({
          id: z.string(),
          name: z.string(),
        }),
        reviewers: z.array(z.object({ id: z.string() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        setup: { id, name },
        reviewers,
      } = input;
      return await ctx.prisma.feedbackRequestNotification.createMany({
        data: reviewers.map(reviewer => ({
          message: `${
            ctx.session.user.name ?? 'Driver'
          } requests feedback on ${name}`,
          receiverId: reviewer.id,
          setupId: id,
        })),
      });
    }),
});
