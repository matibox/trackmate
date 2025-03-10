import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const telemetryMetadataSchema = z.object({
  game: z.string(),
  track: z.string(),
  car: z.string(),
  filename: z.string(),
  path: z.string(),
  size: z.number(),
});

export const telemetryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(telemetryMetadataSchema)
    .mutation(async ({ input }) => {
      try {
        // TODO: Save metadata to database
        return {
          success: true,
          ...input,
        };
      } catch (error) {
        console.error('Error saving telemetry metadata:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save telemetry metadata',
        });
      }
    }),
});
