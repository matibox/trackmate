import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T, K extends string | number>(
  array: T[],
  property: (item: T) => K
): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = property(item).toString();

      if (!acc[key]) {
        acc[key] = [];
      }

      (acc[key] as unknown as T[]).push(item);

      return acc;
    },
    {} as Record<string, T[]>
  );
}

export function objectKeys<T extends object>(obj: T) {
  return Object.keys(obj) as Array<keyof T>;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result as Omit<T, K>;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]) {
  const result = {} as Pick<T, K>;
  keys.forEach(key => (result[key] = obj[key]));
  return result;
}
