import { expect, it, describe } from 'vitest';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { appRouter } from '../../root';
import { type RouterInputs } from '~/utils/api';
import { prisma } from '~/server/db';
import { type Session } from 'next-auth';

type User = Session['user'];

describe('mutation: submitForm', () => {
  it('unauthed user should not be able to submit a form', async () => {
    const ctx = createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs['welcome']['submitForm'] = {
      stepOne: {
        firstName: 'test',
        lastName: 'test',
        username: 'test',
      },
      stepTwo: {
        country: 'test',
        mainGame: 'Assetto Corsa Competizione',
      },
      stepThreeCreateTeam: {
        abbreviation: 'aaa',
        password: 'test',
        teamName: 'test',
      },
      stepThreeJoinTeam: null,
      stepThreeSkip: null,
    };

    await expect(caller.welcome.submitForm(input)).rejects.toThrowError();
  });

  it('should throw error if no step 3 option is provided', async () => {
    const ctx = createInnerTRPCContext({
      session: { expires: '1000', user: { id: 'test' } as User },
    });
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs['welcome']['submitForm'] = {
      stepOne: {
        firstName: 'test',
        lastName: 'test',
        username: 'test',
      },
      stepTwo: {
        country: 'test',
        mainGame: 'Assetto Corsa Competizione',
      },
      stepThreeCreateTeam: null,
      stepThreeJoinTeam: null,
      stepThreeSkip: null,
    };

    await expect(caller.welcome.submitForm(input)).rejects.toThrowError();
  });

  it('should update user, create profile, create new team and assign owner role', async () => {
    const ctx = createInnerTRPCContext({
      session: { expires: '1000', user: { id: 'test' } as User },
    });
    const caller = appRouter.createCaller(ctx);

    await prisma.$transaction([
      prisma.usersOnTeams.deleteMany({
        where: { userId: 'test' },
      }),
      prisma.team.deleteMany({ where: { name: 'test' } }),
      prisma.user.deleteMany({ where: { id: 'test' } }),
      prisma.user.create({
        data: { id: 'test' },
      }),
      prisma.profile.deleteMany({
        where: { userId: ctx.session?.user.id },
      }),
    ]);

    const input: RouterInputs['welcome']['submitForm'] = {
      stepOne: {
        firstName: 'test',
        lastName: 'test',
        username: 'test',
      },
      stepTwo: {
        country: 'test',
        mainGame: 'Assetto Corsa Competizione',
      },
      stepThreeCreateTeam: {
        abbreviation: 'AAA',
        password: 'test',
        teamName: 'test',
      },
      stepThreeJoinTeam: null,
      stepThreeSkip: null,
    };

    await caller.welcome.submitForm(input);
    const userWithProfileAndTeamRole = await prisma.user.findUnique({
      where: { id: ctx.session?.user.id },
      select: {
        profile: true,
        teams: { where: { team: { name: 'test' } }, select: { role: true } },
      },
    });

    expect(userWithProfileAndTeamRole).not.toBeNull();
    expect(userWithProfileAndTeamRole?.profile).toEqual({
      ...input.stepTwo,
      id: userWithProfileAndTeamRole?.profile?.id,
      userId: ctx.session?.user.id,
      mainGame: input.stepTwo.mainGame.replaceAll(' ', '_'),
      bio: null,
    });
    expect(userWithProfileAndTeamRole?.teams[0]?.role).toEqual('owner');
  });

  it('should update user, create profile and join existing team with member role', async () => {
    const ctx = createInnerTRPCContext({
      session: { expires: '1000', user: { id: 'test' } as User },
    });
    const caller = appRouter.createCaller(ctx);

    await prisma.$transaction([
      prisma.usersOnTeams.deleteMany({
        where: { userId: 'test' },
      }),
      prisma.team.deleteMany({ where: { name: 'test' } }),
      prisma.team.create({
        data: {
          id: 'testteam',
          name: 'test',
          abbreviation: 'AAA',
          password: 'test',
        },
      }),
      prisma.user.deleteMany({ where: { id: 'test' } }),
      prisma.user.create({
        data: { id: 'test' },
      }),
      prisma.profile.deleteMany({
        where: { userId: ctx.session?.user.id },
      }),
    ]);

    const input: RouterInputs['welcome']['submitForm'] = {
      stepOne: {
        firstName: 'test',
        lastName: 'test',
        username: 'test',
      },
      stepTwo: {
        country: 'test',
        mainGame: 'Assetto Corsa Competizione',
      },
      stepThreeCreateTeam: null,
      stepThreeJoinTeam: {
        teamName: 'test',
      },
      stepThreeSkip: null,
    };

    await caller.welcome.submitForm(input);
    const userWithProfileAndTeamRole = await prisma.user.findUnique({
      where: { id: ctx.session?.user.id },
      select: {
        profile: true,
        teams: { where: { team: { name: 'test' } }, select: { role: true } },
      },
    });

    expect(userWithProfileAndTeamRole).not.toBeNull();
    expect(userWithProfileAndTeamRole?.profile).toEqual({
      ...input.stepTwo,
      id: userWithProfileAndTeamRole?.profile?.id,
      userId: ctx.session?.user.id,
      mainGame: input.stepTwo.mainGame.replaceAll(' ', '_'),
      bio: null,
    });
    expect(userWithProfileAndTeamRole?.teams[0]?.role).toEqual('member');
  });

  it('should return a user when continuing without a team', async () => {
    const ctx = createInnerTRPCContext({
      session: { expires: '1000', user: { id: 'test' } as User },
    });
    const caller = appRouter.createCaller(ctx);

    await prisma.$transaction([
      prisma.usersOnTeams.deleteMany({
        where: { userId: 'test' },
      }),
      prisma.team.deleteMany({ where: { name: 'test' } }),
      prisma.team.create({
        data: {
          id: 'testteam',
          name: 'test',
          abbreviation: 'AAA',
          password: 'test',
        },
      }),
      prisma.user.deleteMany({ where: { id: 'test' } }),
      prisma.user.create({
        data: { id: 'test' },
      }),
      prisma.profile.deleteMany({
        where: { userId: ctx.session?.user.id },
      }),
    ]);

    const input: RouterInputs['welcome']['submitForm'] = {
      stepOne: {
        firstName: 'test',
        lastName: 'test',
        username: 'test',
      },
      stepTwo: {
        country: 'test',
        mainGame: 'Assetto Corsa Competizione',
      },
      stepThreeCreateTeam: null,
      stepThreeJoinTeam: null,
      stepThreeSkip: true,
    };

    const user = await caller.welcome.submitForm(input);
    expect(user).not.toBeUndefined();
    expect(user?.id).toBe(ctx.session?.user.id);
  });
});
