import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { newEventSchema } from '~/app/(dashboard)/calendar/new/_components/formSchema';

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(newEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { date, name, game, track, car, teamId, driverIds } = input;

      // const event = await ctx.db.insert(events).values({
      //   date,
      //   name,
      //   game,
      //   track,
      //   car,
      // });
    }),
});
