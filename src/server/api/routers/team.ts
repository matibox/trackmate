import { z } from 'zod';
import { createTRPCRouter, driverProcedure, managerProcedure } from '../trpc';

export const teamRouter = createTRPCRouter({
  getDriveFor: driverProcedure.query(async ({ ctx }) => {
    const team = await ctx.prisma.team.findFirst({
      where: { drivers: { some: { id: { equals: ctx.session.user.id } } } },
    });

    if (!team) {
      return { notFound: true, team };
    }

    return { notFound: false, team };
  }),
  getManagingFor: managerProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.team.findUnique({
      where: {
        managerId: ctx.session.user.id,
      },
      include: {
        drivers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }),
  create: managerProcedure
    .input(
      z.object({
        name: z.string(),
        drivers: z.array(z.object({ id: z.string(), name: z.string() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, drivers } = input;

      return await ctx.prisma.team.create({
        data: {
          name,
          drivers: {
            connect: drivers.map(driver => ({ id: driver.id })),
          },
          manager: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  delete: managerProcedure
    .input(z.object({ teamId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.team.delete({ where: { id: input.teamId } });
    }),
});
