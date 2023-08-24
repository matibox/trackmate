import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { stepOneSchema } from '~/core/welcome/components/StepOne';
import { stepTwoSchema } from '~/core/welcome/components/StepTwo';
import { stepThreeCreateTeamSchema } from '~/core/welcome/components/StepThree';
import bcrypt from 'bcrypt';
import { type $Enums } from '@prisma/client';

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
          stepThreeJoinTeam: z.object({}).nullable(),
        })
        .superRefine(({ stepThreeCreateTeam, stepThreeJoinTeam }, ctx) => {
          if (stepThreeCreateTeam === null && stepThreeJoinTeam === null) {
            ctx.addIssue({
              code: 'custom',
              fatal: true,
              message: 'Choose at least one option from step 3.',
              path: ['stepThreeCreateTeam', 'stepThreeJoinTeam'],
            });
          }
        })
    )
    .mutation(async ({ ctx, input }) => {
      const { stepOne, stepTwo, stepThreeCreateTeam, stepThreeJoinTeam } =
        input;

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...stepOne,
          profile: {
            create: {
              ...stepTwo,
              mainGame: stepTwo.mainGame.replaceAll(' ', '_') as $Enums.Game,
            },
          },
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
            owners: { connect: { id: ctx.session.user.id } },
          },
        });
      } else if (stepThreeJoinTeam) {
        console.log('join team');
      }
    }),
});
