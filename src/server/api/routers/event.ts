import { driversToEvents, events, teams } from '~/server/db/schema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { newEventSchema } from '~/app/(dashboard)/calendar/new/_components/formSchema';
import { type TrackName, type CarName } from '~/lib/constants';
import { and, eq, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

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
  ofDriverFromTo: protectedProcedure
    .input(z.object({ from: z.date(), to: z.date() }))
    .query(async ({ ctx, input }) => {
      const { from, to } = input;

      const driverEvents = await ctx.db.query.events.findMany({
        columns: {
          id: true,
          name: true,
          date: true,
          game: true,
          track: true,
          car: true,
        },
        with: {
          drivers: {
            with: {
              driver: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          team: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        where: ({ date }, { and, gte, lte }) =>
          and(gte(date, from), lte(date, to)),
      });

      return driverEvents.map(event => ({
        ...event,
        drivers: event.drivers.map(driverToEvent => driverToEvent.driver),
      }));
    }),
});
