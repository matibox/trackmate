import dayjs from 'dayjs';
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { generateDayGrid } from '~/lib/dates';
import { useCalendar } from './store';
import { cn, getCalendarRowStyles } from '~/lib/utils';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import { useMemo, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/Collapsible';
import { api } from '~/utils/api';

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

export default function Calendar() {
  const { currentDay, nextMonth, prevMonth } = useCalendar();

  const dayGrid = generateDayGrid(currentDay.month(), currentDay.year());

  const [isOpened, setIsOpened] = useState(true);

  const { data: dots } = api.event.getCalendarData.useQuery(
    {
      from: currentDay.date(1).toDate(),
      to: currentDay.date(currentDay.daysInMonth()).toDate(),
    },
    {
      enabled: isOpened,
    }
  );

  return (
    <section className='flex w-full max-w-lg flex-col rounded-md bg-slate-900 ring-1 ring-slate-800 md:gap-4'>
      <header className='flex w-full items-center justify-between px-4 py-2 md:gap-2 md:pb-0'>
        <Button
          aria-label='previous month'
          variant='outline'
          className='h-8 w-8 bg-transparent p-0 md:ml-auto'
          onClick={prevMonth}
        >
          <ChevronLeftIcon className='h-5 w-5' />
        </Button>
        <h1 className='text-lg md:-order-1 md:text-2xl'>
          {currentDay.format('MMMM, YYYY')}
        </h1>
        <Button
          aria-label='next month'
          variant='outline'
          className='h-8 w-8 bg-transparent p-0'
          onClick={nextMonth}
        >
          <ChevronRightIcon className='h-5 w-5' />
        </Button>
      </header>
      <Collapsible
        open={isOpened}
        onOpenChange={setIsOpened}
        className='relative flex flex-col justify-between'
      >
        <CollapsibleContent className='CollapsibleContent md:pb-1'>
          <a
            href='#calendar-skip'
            className='absolute -left-[10000px] focus:left-4 focus:mt-2 focus:bg-slate-950 focus:px-2'
          >
            Skip calendar content
          </a>
          <div className='flex w-full flex-col items-center gap-0.5 px-4 pb-1'>
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
            <div className='flex flex-col items-center gap-3'>
              {dayGrid.map((row, i) => (
                <div key={i} className='relative flex gap-3'>
                  {row.map((day, i) => (
                    <Day
                      key={i}
                      day={day}
                      hasEvent={
                        dots?.filter(
                          d =>
                            dayjs(d.start).format('DD MM YYYY') ===
                            day.format('DD MM YYYY')
                        )?.length !== 0
                      }
                      activeWeek={currentDay.week() === row[0]?.week()}
                      differentMonth={
                        !day.isBetween(
                          currentDay.date(0),
                          currentDay.date(currentDay.daysInMonth() + 1)
                        )
                      }
                    />
                  ))}
                  <div
                    className={cn(
                      'absolute top-0 h-full rounded-md transition',
                      {
                        'bg-slate-800': currentDay.week() === row[0]?.week(),
                      }
                    )}
                    style={getCalendarRowStyles({ row, currentDay })}
                  />
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
        <div className='invisible' id='calendar-skip' />
        <CollapsibleTrigger asChild>
          <Button
            variant='ghost'
            className='h-auto w-full rounded-t-none p-0 py-1 hover:text-sky-500'
            aria-label={`${isOpened ? 'collapse' : 'open'} calendar`}
            style={{
              borderTop: isOpened ? ' ' : '1px solid #1e293b',
            }}
          >
            <ChevronUpIcon
              className='h-5 w-5 transition-[rotate]'
              style={{ rotate: isOpened ? '0deg' : '180deg' }}
            />
          </Button>
        </CollapsibleTrigger>
      </Collapsible>
    </section>
  );
}

function Day({
  day,
  hasEvent = false,
  activeWeek = false,
  differentMonth = false,
}: {
  day: dayjs.Dayjs;
  hasEvent: boolean;
  activeWeek?: boolean;
  differentMonth?: boolean;
}) {
  const { currentDay, selectDay } = useCalendar();

  const isSelected = useMemo(() => currentDay.isSame(day), [currentDay, day]);

  const utils = api.useContext();

  async function changeDay() {
    const weekStart = currentDay.set('day', 1);
    const weekEnd = currentDay.set('day', 7);

    if (day.isBefore(weekStart) || day.isAfter(weekEnd)) {
      await utils.event.fromTo.invalidate();
    }

    selectDay({ day });
  }

  return (
    <button
      className={cn(
        'relative z-10 flex h-[37px] w-[37px] items-center justify-center rounded-md text-sm transition hover:bg-slate-800',
        {
          'hover:bg-slate-700': activeWeek,
          'bg-sky-500 hover:bg-sky-500 focus:bg-sky-500': isSelected,
          'text-slate-400 opacity-50': differentMonth,
          'ring-1 ring-slate-300':
            day.format('DDMMYYYY') === dayjs().format('DDMMYYYY'),
        }
      )}
      onClick={changeDay}
    >
      {day.date()}
      {hasEvent ? (
        <div className='absolute bottom-[5px] left-1/2 flex w-full -translate-x-1/2 justify-center gap-0.5'>
          <div
            className={cn('h-[4px] w-[4px] rounded-full', {
              'bg-slate-50': isSelected,
              'bg-sky-500': !isSelected,
            })}
          />
        </div>
      ) : null}
    </button>
  );
}
