import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import { createTRPCRouter, driverProcedure } from '../trpc';

export const championshipRouter = createTRPCRouter({
  create: driverProcedure
    .input(
      z.object({
        organizer: z.string(),
        link: z.string(),
        car: z.string().optional(),
        type: z.enum(eventTypes),
        teammates: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { organizer, link, car, type, teammates } = input;
      return await ctx.prisma.championship.create({
        data: {
          organizer,
          link,
          type,
          car,
          drivers: {
            connect: teammates?.map(teammate => ({ id: teammate.id })),
          },
        },
      });
    }),
});
