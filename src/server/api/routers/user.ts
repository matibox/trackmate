import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  byId: protectedProcedure
    .input(
      z.object({
        memberIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { memberIds } = input;
      return await ctx.prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: {
          profile: { select: { country: true } },
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      });
    }),
  isInTeamOrRoster: protectedProcedure.query(async ({ ctx }) => {
    const userTeams = await ctx.prisma.team.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
      select: { id: true },
    });

    const userRosters = await ctx.prisma.roster.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
      select: { id: true },
    });

    return {
      isInTeam: userTeams.length > 0,
      isInRoster: userTeams.length > 0 && userRosters.length > 0,
    };
  }),
  isInDiscordServer: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.prisma.account.findMany({
      where: { provider: 'discord', userId: ctx.session.user.id },
      select: { providerAccountId: true, access_token: true },
    });

    if (!accounts || !accounts[0]) return false;

    const { providerAccountId: discordId, access_token: token } = accounts[0];

    if (!discordId || !token) return false;

    console.log(discordId, token);

    const res = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userServers = (await res.json()) as { id: string }[] | undefined;

    return userServers
      ?.map(s => s.id)
      .includes(process.env.DISCORD_SERVER_ID as string);
  }),
});
