'use client';

import dayjs, { generateDayGrid } from '~/lib/dates';
import { Fragment, useMemo } from 'react';
import { cn, groupBy } from '~/lib/utils';
import { buttonVariants } from '~/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useCalendarContext } from './CalendarContext';
import Link from 'next/link';
import { api } from '~/trpc/react';

export default function Calendar() {
  const { now } = useCalendarContext();
  const calendar = generateDayGrid(now.month(), now.year());

  const eventsQuery = api.event.ofDriverFromTo.useQuery({
    from: now.set('date', 0).toDate(),
    to: now.set('date', now.daysInMonth()).toDate(),
  });

  const groupedEvents = useMemo(() => {
    if (!eventsQuery.data) return undefined;
    return groupBy(eventsQuery.data, event => event.shortDate);
  }, [eventsQuery.data]);

  console.log(groupedEvents);

  return (
    <div className="grid-rows-[1fr,_repeat(7,_minmax(0, 1fr))] grid grid-cols-7 pb-px">
      {calendar[0].map((day, i) => (
        <span
          key={i}
          className="sticky top-16 z-50 flex w-full justify-center border-b bg-background py-2 text-sm text-muted-foreground"
        >
          {day.format('ddd')}
        </span>
      ))}
      {calendar.map((row, i) => (
        <Fragment key={i}>
          {row.map((day, i) => (
            <div
              key={i}
              className="group relative min-h-[125px] border-b border-r pt-8"
            >
              <Link
                className={cn(
                  buttonVariants({
                    size: 'icon',
                    variant: 'ghost',
                  }),
                  'absolute left-1 top-1 hidden h-6 w-6 md:group-hover:flex'
                )}
                title="Create event"
                href={`/calendar/new?d=${day.format('DDMMYYYY')}`}
              >
                <PlusIcon />
                <span className="sr-only">Add event</span>
              </Link>
              <div
                className={cn(
                  'absolute right-3 top-2 text-sm font-medium leading-none text-primary-foreground',
                  {
                    'text-muted-foreground': day.month() !== now.month(),
                    'before:absolute before:left-1/2 before:top-1/2 before:min-h-full before:min-w-[120%] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded before:bg-primary before:p-2.5':
                      day.format('YYYYMMDD') === dayjs().format('YYYYMMDD'),
                    '[animation-delay:_75 animate-pulse':
                      eventsQuery.status === 'pending',
                  }
                )}
              >
                <span className="relative z-10">
                  {day.format('D') === '1' && day.format('MMM[ ]')}
                  {day.format('D')}
                </span>
              </div>
              <div className="flex h-full w-full flex-col gap-1.5 px-1.5 pb-1.5">
                {groupedEvents?.[day.format('YYYY/MM/DD')]?.map(event => (
                  <Link
                    href={`/calendar/${event.id}`}
                    key={event.id}
                    className="flex flex-col rounded bg-sidebar px-2 py-1 text-left transition-colors hover:bg-accent"
                  >
                    <span className="block w-full truncate text-sm font-medium">
                      {event.name}
                    </span>
                    {event.team ? (
                      <span className="block w-full truncate text-[12px]">
                        {event.team.name}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
