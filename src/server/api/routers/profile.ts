import { welcomeFormSchema } from '~/app/(entry)/welcome/_components/formSchema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { profiles } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

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
  // READ
  ofUser: protectedProcedure.query(async ({ ctx }) => {
    const foundProfiles = await ctx.db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, ctx.session.user.id));

    return foundProfiles[0];
  }),
});
