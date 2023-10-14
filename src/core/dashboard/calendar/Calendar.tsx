import dayjs from 'dayjs';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { generateDayGrid } from '~/lib/dates';
import { useCalendar } from './store';
import { cn } from '~/lib/utils';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

export default function Calendar() {
  const { getCurrentMonthIndex, currentDay, nextMonth, prevMonth } =
    useCalendar();

  const dayGrid = generateDayGrid(getCurrentMonthIndex());

  return (
    <section className='w-full max-w-lg rounded-md bg-slate-900 ring-1 ring-slate-800'>
      <header className='flex w-full items-center justify-between border-b border-slate-800 p-4'>
        <Button
          aria-label='previous month'
          variant='outline'
          className='h-8 w-8 bg-transparent p-0'
          onClick={prevMonth}
        >
          <ChevronLeftIcon className='h-5 w-5' />
        </Button>
        <h1 className='text-xl'>{currentDay.format('MMMM, YYYY')}</h1>
        <Button
          aria-label='next month'
          variant='outline'
          className='h-8 w-8 bg-transparent p-0'
          onClick={nextMonth}
        >
          <ChevronRightIcon className='h-5 w-5' />
        </Button>
      </header>

      <div className='flex w-full flex-col items-center gap-3 px-4 py-2'>
        <div className='flex gap-3'>
          {dayGrid[0]?.map((day, i) => (
            <span
              key={i}
              className='flex h-[37px] w-[37px] items-center justify-center text-sm font-medium text-slate-300'
            >
              {dayjs(day).format('dd')}
            </span>
          ))}
        </div>
        {dayGrid.map((row, i) => (
          <div
            key={i}
            className={cn('flex gap-3 rounded-md', {
              'bg-slate-800': currentDay.week() === row[0]?.week(),
            })}
          >
            {row.map((day, i) => (
              <Day
                key={i}
                day={day}
                activeWeek={currentDay.week() === row[0]?.week()}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Day({
  day,
  activeWeek = false,
}: {
  day: dayjs.Dayjs;
  activeWeek?: boolean;
}) {
  const { currentDay } = useCalendar();

  return (
    <button
      className={cn(
        'flex h-[37px] w-[37px] items-center justify-center rounded-md text-sm transition hover:bg-slate-800',
        {
          'hover:bg-slate-700': activeWeek,
          'bg-sky-500 hover:bg-sky-500 focus:bg-sky-500':
            currentDay.isSame(day),
        }
      )}
    >
      {day.date()}
    </button>
  );
}
