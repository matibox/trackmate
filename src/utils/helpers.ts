import { type RoleName } from '@prisma/client';
import type { Session } from 'next-auth';

export const formatErrors = (errors: string[] | undefined) =>
  errors?.reduce((a, b) => `${a}. ${b}`);

export const capitilize = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const hasRole = (
  session: Session | null,
  roleName: RoleName | RoleName[]
) => {
  if (typeof roleName === 'string') {
    return session?.user?.roles?.find(role => role.name === roleName);
  }

  return session?.user?.roles?.every(role => roleName.includes(role.name));
};
