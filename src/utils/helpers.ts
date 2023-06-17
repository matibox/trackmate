import { type RoleName } from '@prisma/client';
import type { Session } from 'next-auth';
import { type Entries } from '../types/utils';
import dayjs from 'dayjs';

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

export const splitOnUppercase = (string: string) =>
  string.split(/(?=[A-Z])/).join(' ');

export const splitAndCapitilize = (string: string) =>
  capitilize(splitOnUppercase(string).toLowerCase());

export const objectEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as Entries<T>;

export const getMinutes = (date: Date) => {
  const [hours, minutes] = dayjs(date)
    .format('HH:mm')
    .split(':')
    .map(Number) as [number, number];
  return minutes + hours * 60;
};
