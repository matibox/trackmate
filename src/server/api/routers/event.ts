import { driversToEvents, events } from '~/server/db/schema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { newEventSchema } from '~/app/(dashboard)/calendar/new/_components/formSchema';
import { type TrackName, type CarName } from '~/lib/constants';

export const eventRouter = createTRPCRouter({
  // CREATE
  create: protectedProcedure
    .input(newEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { car, date, driverIds, game, name, teamId, track } = input;

      const event = (
        await ctx.db
          .insert(events)
          .values({
            car: car as CarName,
            track: track as TrackName,
            date,
            name,
            game,
            teamId,
          })
          .returning({ id: events.id })
      )[0];

      for (const driverId of driverIds) {
        await ctx.db.insert(driversToEvents).values({
          driverId,
          eventId: event.id,
        });
      }

      return event;
    }),

  // READ
});
