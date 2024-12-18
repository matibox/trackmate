'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { useCalendarContext } from './CalendarContext';

export default function CalendarNav() {
  const { nextMonth, prevMonth, setToday, date } = useCalendarContext();

  return (
    <section className="flex h-16 w-full shrink-0 items-center gap-2 px-4">
      <SidebarTrigger />
      <div className="mr-2 h-4 w-px shrink-0 bg-border" />
      <span className="text-primary">Calendar</span>
      <span className="ml-auto text-sm font-medium">
        {date.format('MMMM YYYY')}
      </span>
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
    </section>
  );
}
