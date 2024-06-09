import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import bcrypt from 'bcrypt';
import { TRPCError } from '@trpc/server';
import { games } from '~/lib/constants';
import { type ReplaceAll } from '~/lib/utils';
import { newTeamSchema } from '~/core/dashboard/teams/new-team/NewTeam';
import { gameStrToDbStr, hashPassword } from '../utils/utils';
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
  memberOf: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        profilePicture: true,
      },
    });
  }),
  rostersByGame: protectedProcedure
    .input(z.object({ teamId: z.string(), game: z.enum(games) }))
    .query(async ({ ctx, input }) => {
      const { game: _game, teamId } = input;
      const game = gameStrToDbStr(_game);

      const team = await ctx.prisma.team.findUnique({
        where: { id: teamId },
        select: {
          rosters: {
            where: { game },
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This team has no rosters.',
        });
      }

      return team.rosters;
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
  memberOfRoles: protectedProcedure.query(async ({ ctx }) => {
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
  listWithFilter: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        searchQuery: z.string().nullish(),
        cursor: z.string().nullish(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor, searchQuery } = input;
      const teams = await ctx.prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery ?? '', mode: 'insensitive' } },
            {
              abbreviation: {
                contains: searchQuery ?? '',
                mode: 'insensitive',
              },
            },
          ],
        },
        take: limit + 1,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: 'asc' },
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

      let nextCursor: typeof cursor | undefined = undefined;
      if (teams.length > limit) {
        const nextTeam = teams.pop();
        nextCursor = nextTeam?.id;
      }

      return {
        teams,
        nextCursor,
      };
    }),
  delete: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId } = input;
      return await ctx.prisma.team.delete({ where: { id: teamId } });
    }),
  create: protectedProcedure
    .input(
      newTeamSchema.omit({ profilePicture: true, password: true }).and(
        z.object({
          password: z.string(),
          profilePicture: z.string().optional(),
        })
      )
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
  edit: protectedProcedure
    .input(
      newTeamSchema
        .partial()
        .omit({ profilePicture: true, password: true })
        .and(
          z.object({
            teamId: z.string(),
            profilePicture: z.string().optional(),
          })
        )
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, name, abbreviation, profilePicture } = input;

      await ctx.prisma.team.update({
        where: { id: teamId },
        data: {
          name,
          abbreviation,
          profilePicture,
        },
      });
    }),
});
