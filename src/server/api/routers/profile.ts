import { welcomeFormSchema } from '~/app/(entry)/welcome/_components/formSchema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { profiles } from '~/server/db/schema';

export const profileRouter = createTRPCRouter({
  // CREATE
  create: protectedProcedure
    .input(welcomeFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, country } = input;

      await ctx.db.insert(profiles).values({
        userId: ctx.session.user.id,
        firstName,
        lastName,
        country,
      });
    }),
});
