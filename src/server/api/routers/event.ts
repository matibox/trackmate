import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const eventRouter = createTRPCRouter({
  createChampionshipEvent: protectedProcedure
    .input(
      z.object({
        title: z.string().nullable(),
        date: z.date(),
        type: z.enum(eventTypes),
        car: z.string(),
        track: z.string(),
        duration: z.number(),
        championshipId: z.string(),
        managerId: z.string().optional(),
        drivers: z
          .array(z.object({ id: z.string(), name: z.string().nullable() }))
          .nullable(),
        teamId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { drivers, ...data } = input;
      return await ctx.prisma.event.create({
        data: {
          ...data,
          drivers: {
            connect:
              drivers && drivers.length > 0
                ? drivers.map(driver => ({ id: driver.id }))
                : {
                    id: ctx.session.user.id,
                  },
          },
        },
      });
    }),
});
