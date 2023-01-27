import type { Session } from 'next-auth';
import type { roles } from '../constants/constants';

export const formatErrors = (errors: string[] | undefined) =>
  errors?.reduce((a, b) => `${a}. ${b}`);

export const capitilize = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const hasRole = (
  session: Session | null,
  roleName: (typeof roles)[number]
) => session?.user?.roles?.find(role => role.name === roleName);
