import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T>(arr: T[], fn: (item: T) => string | number) {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const groupKey = fn(curr);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const group = prev[groupKey] || [];
    group.push(curr);
    return { ...prev, [groupKey]: group };
  }, {});
}

export type ReplaceAll<
  T extends string,
  From extends string,
  To extends string
> = From extends ''
  ? T
  : T extends `${infer L}${From}${infer R}`
  ? `${L}${To}${ReplaceAll<R, From, To>}`
  : T;

export function objKeys<T extends object>(obj: T) {
  return Object.keys(obj) as Array<keyof T>;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function timeStringToDate(str: string, date = dayjs()) {
  const [hours, minutes] = str.split(':').map(Number) as [number, number];
  return dayjs(
    new Date(date.year(), date.month(), date.date(), hours, minutes)
  );
}
export function timeStringToMinutes(str: string) {
  const [hours, minutes] = str.split(':').map(Number) as [number, number];
  return hours * 60 + minutes;
}
