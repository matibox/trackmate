import { expect, it, describe } from 'vitest';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { appRouter } from '../../root';
import { type RouterInputs } from '~/utils/api';

describe('mutation: submitForm', () => {
  it('unauther user should not be able to submit a form', async () => {
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
});
