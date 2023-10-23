import { clsx, type ClassValue } from 'clsx';
import dayjs, { type Dayjs } from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T, K extends string | number>(
  array: T[],
  property: (item: T) => K
): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = property(item).toString();

    if (!acc[key]) {
      acc[key] = [];
    }

    (acc[key] as T[]).push(item);

    return acc;
  }, {} as Record<string, T[]>);
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

export function getCalendarRowStyles({
  row,
  currentDay,
}: {
  row: Dayjs[];
  currentDay: Dayjs;
}) {
  let counter = 0;

  for (const day of row) {
    if (
      !day.isBetween(
        currentDay.date(0),
        currentDay.date(currentDay.daysInMonth() + 1)
      )
    ) {
      counter++;
    }
  }

  const direction =
    currentDay.week() === currentDay.date(currentDay.daysInMonth() + 1).week()
      ? 'right'
      : 'left';

  const offset = `calc(${counter * 37}px + ${counter * 0.75}rem)`;
  const width = `calc(${(7 - counter) * 37}px + ${(6 - counter) * 0.75}rem)`;

  return {
    [direction]: offset,
    width: counter > 0 ? width : '100%',
  };
}
