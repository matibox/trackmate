import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { stepOneSchema } from '~/core/welcome/components/StepOne';
import { stepTwoSchema } from '~/core/welcome/components/StepTwo';
import {
  stepThreeCreateTeamSchema,
  stepThreeJoinTeamSchema,
} from '~/core/welcome/components/StepThree';
import bcrypt from 'bcrypt';
import { TRPCError } from '@trpc/server';
import { type ReplaceAll } from '~/lib/utils';

import { Client, Events, GatewayIntentBits } from 'discord.js';
import schedule from 'node-schedule';
import dayjs from 'dayjs';

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export const welcomeRouter = createTRPCRouter({
  isUsernameTaken: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { username } = input;
      const foundUser = await ctx.prisma.user.findUnique({
        where: { username },
      });
      return Boolean(foundUser);
    }),
  isTeamDataTaken: protectedProcedure
    .input(z.object({ teamName: z.string(), abbreviation: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamName, abbreviation } = input;

      const foundTeamByName = await ctx.prisma.team.findUnique({
        where: { name: teamName },
      });
      const foundTeamByAbbrev = await ctx.prisma.team.findUnique({
        where: { abbreviation: abbreviation.toUpperCase() },
      });

      return {
        isNameTaken: Boolean(foundTeamByName),
        isAbbreviationTaken: Boolean(foundTeamByAbbrev),
      };
    }),
  submitForm: protectedProcedure
    .input(
      z
        .object({
          stepOne: stepOneSchema,
          stepTwo: stepTwoSchema,
          stepThreeCreateTeam: stepThreeCreateTeamSchema.nullable(),
          stepThreeJoinTeam: stepThreeJoinTeamSchema
            .omit({ password: true })
            .nullable(),
          stepThreeSkip: z.boolean().nullable(),
        })
        .superRefine(
          ({ stepThreeCreateTeam, stepThreeJoinTeam, stepThreeSkip }, ctx) => {
            if (
              stepThreeCreateTeam === null &&
              stepThreeJoinTeam === null &&
              stepThreeSkip === null
            ) {
              ctx.addIssue({
                code: 'custom',
                fatal: true,
                message: 'Choose at least one option from step 3.',
                path: ['stepThreeCreateTeam', 'stepThreeJoinTeam'],
              });
            }
          }
        )
    )
    .mutation(async ({ ctx, input }) => {
      const {
        stepOne,
        stepTwo,
        stepThreeCreateTeam,
        stepThreeJoinTeam,
        stepThreeSkip,
      } = input;

      const game = stepTwo.mainGame.replaceAll(' ', '_') as ReplaceAll<
        typeof stepTwo.mainGame,
        ' ',
        '_'
      >;

      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...stepOne,
          profile: {
            create: {
              ...stepTwo,
              mainGame: game,
            },
          },
          active: true,
        },
      });

      if (stepThreeCreateTeam) {
        const { password, teamName: name, abbreviation } = stepThreeCreateTeam;
        const hashedPassword = await hashPassword(password);

        await ctx.prisma.team.create({
          data: {
            name,
            abbreviation: abbreviation.toUpperCase(),
            password: hashedPassword,
            members: {
              create: {
                role: 'owner',
                user: { connect: { id: ctx.session.user.id } },
              },
            },
            rosters: {
              create: {
                name: 'Default',
                game: game,
                members: {
                  createMany: {
                    data: [
                      { role: 'driver', userId: ctx.session.user.id },
                      { role: 'manager', userId: ctx.session.user.id },
                    ],
                  },
                },
              },
            },
          },
        });
      } else if (stepThreeJoinTeam) {
        const { teamName: name } = stepThreeJoinTeam;

        const foundTeam = await ctx.prisma.team.findUnique({
          where: { name },
        });

        if (!foundTeam) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team not found.',
          });
        }

        await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            teams: {
              create: {
                role: 'member',
                team: { connect: { name } },
              },
            },
          },
        });
      } else if (stepThreeSkip) {
        return user;
      }
    }),
  greetUser: protectedProcedure.mutation(async () => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once(Events.ClientReady, client => {
      schedule.scheduleJob(dayjs().add(10, 'second').toDate(), async () => {
        await client.users.send('459023179801952286', 'lol it works');
      });
    });

    await client.login(process.env.DISCORD_BOT_TOKEN as string);
  }),
});
