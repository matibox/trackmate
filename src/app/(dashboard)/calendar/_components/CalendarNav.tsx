'use client';

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
import { Button, buttonVariants } from '~/components/ui/button';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { useCalendarContext } from './CalendarContext';
import Link from 'next/link';
import { cn } from '~/lib/utils';

export default function CalendarNav() {
  const { nextMonth, prevMonth, setToday, now: date } = useCalendarContext();

  return (
    <section className="flex h-16 w-full shrink-0 items-center justify-center gap-2 px-4">
      <SidebarTrigger className="mr-auto md:mr-0" />
      <div className="hidden h-4 w-px shrink-0 bg-border md:block" />
      <span className="ml-2 hidden text-primary-foreground md:mr-auto md:block">
        Calendar
      </span>
      <span className="text-sm font-medium">{date.format('MMM YYYY')}</span>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={prevMonth}
        >
          <ChevronLeftIcon />
          <span className="sr-only">Previous month</span>
        </Button>
        <Button variant="ghost" className="h-7 px-2" onClick={setToday}>
          <span>Today</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={nextMonth}
        >
          <ChevronRightIcon />
          <span className="sr-only">Next month</span>
        </Button>
      </div>
      <Link
        className={cn(
          buttonVariants({ variant: 'default', size: 'sm' }),
          'ml-auto h-8 max-w-[2rem] md:max-w-none'
        )}
        href="/calendar/new"
      >
        <span className="hidden md:inline-block">New event</span>
        <PlusIcon />
      </Link>
    </section>
  );
}
