import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { telemetry } from '~/server/db/schema';
import { type CarName, type Game, type TrackName } from '~/lib/constants';

const telemetryMetadataSchema = z.object({
  game: z.string(),
  track: z.string(),
  car: z.string(),
  filename: z.string(),
  url: z.string(),
  size: z.number(),
});

export const telemetryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(telemetryMetadataSchema)
    .mutation(async ({ ctx, input }) => {
      const { car, filename, url, game, size, track } = input;

      try {
        await ctx.db.insert(telemetry).values({
          game: game as Game,
          track: track as TrackName,
          car: car as CarName,
          filename,
          url,
          size,
          userId: ctx.session.user.id,
        });
      } catch (error) {
        console.error('Error saving telemetry metadata:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save telemetry metadata.',
        });
      }
    }),
});
