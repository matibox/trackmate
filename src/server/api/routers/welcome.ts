import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { stepOneSchema } from '~/core/welcome/components/StepOne';
import { stepTwoSchema } from '~/core/welcome/components/StepTwo';
import { stepThreeCreateTeamSchema } from '~/core/welcome/components/StepThree';
import bcrypt from 'bcrypt';

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export const welcomeRouter = createTRPCRouter({
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
        data: stepOne,
      });

      if (stepThreeCreateTeam) {
        const { password, teamName: name, abbreviation } = stepThreeCreateTeam;
        const hashedPassword = await hashPassword(password);

        await ctx.prisma.team.create({
          data: {
            name,
            abbreviation,
            password: hashedPassword,
            owners: { connect: { id: ctx.session.user.id } },
          },
        });
      } else if (stepThreeJoinTeam) {
        console.log('join team');
      }
    }),
});
