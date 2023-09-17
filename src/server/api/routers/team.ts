import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import bcrypt from 'bcrypt';
import { TRPCError } from '@trpc/server';

export const teamRouter = createTRPCRouter({
  byQuery: publicProcedure
    .input(z.object({ q: z.string() }))
    .query(async ({ ctx, input }) => {
      const { q } = input;
      return await ctx.prisma.team.findMany({
        where: { name: { contains: q } },
      });
    }),
  checkPassword: protectedProcedure
    .input(z.object({ teamName: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamName, password } = input;

      const foundTeam = await ctx.prisma.team.findUnique({
        where: { name: teamName },
        select: { password: true },
      });

      if (!foundTeam) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found.',
        });
      }

      return await bcrypt.compare(password, foundTeam.password);
    }),
  memberOfWithMembers: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
      select: {
        id: true,
        abbreviation: true,
        name: true,
        members: {
          select: {
            user: {
              select: {
                profile: { select: { country: true } },
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }),
});
