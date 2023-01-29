import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import { createTRPCRouter, driverProcedure } from '../trpc';

export const championshipRouter = createTRPCRouter({
  get: driverProcedure
    .input(z.object({ max: z.number().min(0).optional().default(2) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.championship.findMany({
        where: { drivers: { some: { id: ctx.session.user.id } } },
        include: {
          events: {
            orderBy: { date: 'desc' },
            take: 1,
            include: {
              drivers: {
                select: { id: true, name: true },
              },
            },
          },
          drivers: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: input.max === 0 ? undefined : input.max,
        // TODO add championship start and end
        // ?^ maybe order by these dates
      });
    }),
  create: driverProcedure
    .input(
      z.object({
        name: z.string(),
        organizer: z.string(),
        link: z.string(),
        car: z.string().nullable(),
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
      const { name, organizer, link, car, type, teammates } = input;
      return await ctx.prisma.championship.create({
        data: {
          name,
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
