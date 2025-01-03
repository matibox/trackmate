'use client';

import dayjs, { generateDayGrid } from '~/lib/dates';
import { Fragment } from 'react';
import { cn } from '~/lib/utils';
import { buttonVariants } from '~/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useCalendarContext } from './CalendarContext';
import Link from 'next/link';

export default function Calendar() {
  const { date: today } = useCalendarContext();
  const calendar = generateDayGrid(today.month(), today.year());

  return (
    <div className="grid-rows-[1fr,_repeat(7,_minmax(0, 1fr))] grid grid-cols-7">
      {calendar[0].map((day, i) => (
        <span
          key={i}
          className="flex w-full justify-center border-b py-2 text-sm text-muted-foreground"
        >
          {day.format('ddd')}
        </span>
      ))}
      {calendar.map((row, i) => (
        <Fragment key={i}>
          {row.map((day, i) => (
            <div
              key={i}
              className="group relative min-h-[125px] border-b border-r"
            >
              <Link
                className={buttonVariants({
                  size: 'icon',
                  variant: 'ghost',
                  className:
                    'absolute left-1 top-1 hidden h-6 w-6 group-hover:flex',
                })}
                title="Create event"
                href={`/calendar/new?d=${day.format('DDMMYYYY')}`}
              >
                <PlusIcon />
                <span className="sr-only">Add event</span>
              </Link>
              <div
                className={cn(
                  'absolute right-2 top-2 text-sm font-medium leading-none text-primary-foreground',
                  {
                    'text-muted-foreground': day.month() !== today.month(),
                    'before:absolute before:left-1/2 before:top-1/2 before:min-h-full before:min-w-[120%] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded before:bg-primary before:p-2.5':
                      day.format('YYYYMMDD') === dayjs().format('YYYYMMDD'),
                  }
                )}
              >
                <span className="relative z-10">
                  {day.format('D') === '1' && day.format('MMM[ ]')}
                  {day.format('D')}
                </span>
              </div>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
