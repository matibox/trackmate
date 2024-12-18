import dayjs, { generateDayGrid } from '~/lib/dates';
import CalendarNav from './_components/CalendarNav';
import { Fragment } from 'react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { PlusIcon } from 'lucide-react';

export default async function CalendarPage() {
  const calendar = generateDayGrid();

  return (
    <>
      <CalendarNav />
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1 hidden h-6 w-6 group-hover:flex"
                  title="Create event"
                >
                  <PlusIcon />
                  <span className="sr-only">Add event</span>
                </Button>
                <div
                  className={cn(
                    'absolute right-2 top-2 text-sm font-medium leading-none text-primary',
                    {
                      'text-muted-foreground': day.month() !== dayjs().month(),
                      'before:absolute before:left-1/2 before:top-1/2 before:min-h-full before:min-w-[120%] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded before:bg-sky-600 before:p-2.5':
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
    </>
  );
}
