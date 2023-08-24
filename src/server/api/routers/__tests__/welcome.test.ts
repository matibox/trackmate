import { expect, it, describe } from 'vitest';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { appRouter } from '../../root';
import { type RouterInputs } from '~/utils/api';
import { prisma } from '~/server/db';

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
    };

    await expect(caller.welcome.submitForm(input)).rejects.toThrowError();
  });

  it('should throw error if no step 3 option is provided', async () => {
    const ctx = createInnerTRPCContext({
      session: { expires: '1000', user: { id: 'test' } },
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
    };

    await expect(caller.welcome.submitForm(input)).rejects.toThrowError();
  });

  it('should update user, create profile and create new team', async () => {
    const ctx = createInnerTRPCContext({
      session: { expires: '1000', user: { id: 'test' } },
    });
    const caller = appRouter.createCaller(ctx);

    await prisma.$transaction([
      prisma.team.deleteMany({
        where: { owners: { some: { id: ctx.session?.user.id } } },
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
      stepThreeCreateTeam: {
        abbreviation: 'aaa',
        password: 'test',
        teamName: 'test',
      },
      stepThreeJoinTeam: null,
    };

    await caller.welcome.submitForm(input);
    const userWithProfile = await prisma.user.findUnique({
      where: { id: ctx.session?.user.id },
      select: { profile: true },
    });

    expect(userWithProfile).not.toBeNull();
    expect(userWithProfile?.profile).toEqual({
      ...input.stepTwo,
      id: userWithProfile?.profile?.id,
      userId: ctx.session?.user.id,
      mainGame: input.stepTwo.mainGame.replaceAll(' ', '_'),
      bio: null,
    });
  });
});
