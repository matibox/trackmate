import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import bcrypt from 'bcrypt';
import { TRPCError } from '@trpc/server';
import { games } from '~/lib/constants';
import { type ReplaceAll } from '~/lib/utils';
import { newTeamSchema } from '~/core/dashboard/teams/new-team/NewTeam';
import { hashPassword } from '../utils/utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
  withRostersByGame: protectedProcedure
    .input(z.object({ game: z.enum(games) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.team.findMany({
        where: { members: { some: { userId: ctx.session.user.id } } },
        select: {
          id: true,
          abbreviation: true,
          name: true,
          rosters: {
            where: {
              game: input.game.replaceAll(' ', '_') as ReplaceAll<
                typeof input.game,
                ' ',
                '_'
              >,
            },
            select: {
              id: true,
              game: true,
              name: true,
              members: {
                where: { role: 'driver' },
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
          },
        },
      });
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        profilePicture: true,
        members: {
          where: { userId: ctx.session.user.id },
          select: { role: true },
        },
        rosters: {
          select: {
            members: {
              where: { userId: ctx.session.user.id },
              select: { role: true },
            },
          },
        },
      },
    });
  }),
  delete: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId } = input;
      return await ctx.prisma.team.delete({ where: { id: teamId } });
    }),
  create: protectedProcedure
    .input(
      newTeamSchema
        .omit({ profilePicture: true })
        .and(z.object({ profilePicture: z.string().optional() }))
    )
    .mutation(async ({ ctx, input }) => {
      const { name, abbreviation, password, profilePicture } = input;
      const hashedPassword = await hashPassword(password);

      try {
        await ctx.prisma.team.create({
          data: {
            name,
            abbreviation: abbreviation.toUpperCase(),
            password: hashedPassword,
            profilePicture,
            members: {
              create: {
                role: 'owner',
                userId: ctx.session.user.id,
              },
            },
          },
        });
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Team name is already taken.',
            });
          }
        }
      }
    }),
});
