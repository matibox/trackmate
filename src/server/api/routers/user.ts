import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { roles } from '../../../constants/constants';

import {
  createTRPCRouter,
  managerProcedure,
  protectedProcedure,
  publicProcedure,
} from '../trpc';

export const userRouter = createTRPCRouter({
  __devToggleRole: protectedProcedure
    .input(z.object({ roleName: z.enum(roles) }))
    .mutation(async ({ ctx, input }) => {
      const { roleName } = input;
      if (process.env.NODE_ENV !== 'development') return;
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          roles: ctx.session.user.roles?.some(role => role.name === roleName)
            ? {
                disconnect: { name: roleName },
              }
            : {
                connectOrCreate: {
                  where: { name: roleName },
                  create: { name: roleName },
                },
              },
        },
      });
    }),
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
        where: {
          AND: [
            { name: { contains: q } },
            { roles: { some: { name: 'driver' } } },
            { team: null },
          ],
        },
      });

      if (!drivers) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No drivers found' });
      }

      return drivers;
    }),
  getManagers: managerProcedure
    .input(z.object({ q: z.string() }))
    .query(async ({ ctx, input }) => {
      const { q } = input;
      const managers = await ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
        },
        where: {
          AND: [
            { id: { not: ctx.session.user.id } },
            { name: { contains: q } },
            { roles: { some: { name: 'manager' } } },
            { managingTeam: null },
          ],
        },
      });

      if (!managers) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No managers found',
        });
      }

      return managers;
    }),
  getSocialMedia: managerProcedure
    .input(z.object({ q: z.string() }))
    .query(async ({ ctx, input }) => {
      const { q } = input;
      const socialMediaManagers = await ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
        },
        where: {
          AND: [
            { name: { contains: q } },
            { roles: { some: { name: 'socialMedia' } } },
            { socialManagingTeam: null },
          ],
        },
      });

      if (!socialMediaManagers) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No social media managers found',
        });
      }

      return socialMediaManagers;
    }),
  getProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      return await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          image: true,
          createdAt: true,
          team: { select: { id: true, name: true } },
          events: {
            include: {
              drivers: { select: { id: true, name: true, teamId: true } },
              championship: { select: { organizer: true, name: true } },
              team: {
                select: {
                  id: true,
                  results: {
                    where: { event: { drivers: { some: { id: userId } } } },
                  },
                },
              },
              result: true,
            },
            orderBy: { date: 'desc' },
          },
        },
      });
    }),
  calendar: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          sharedCalendar: true,
          events: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.',
        });
      }

      if (!user.sharedCalendar) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "User's calendar is not shared.",
        });
      }

      return user;
    }),
});
