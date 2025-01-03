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
