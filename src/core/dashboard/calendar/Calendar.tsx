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
import { type RouterOutputs, api } from '~/utils/api';

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
    <>
      <section className='flex w-full max-w-lg flex-col rounded-md bg-slate-900 ring-1 ring-slate-800'>
        <header className='flex w-full items-center justify-between border-b border-slate-800 px-4 py-2'>
          <Button
            aria-label='previous month'
            variant='outline'
            className='h-8 w-8 bg-transparent p-0'
            onClick={prevMonth}
          >
            <ChevronLeftIcon className='h-5 w-5' />
          </Button>
          <h1 className='text-lg'>{currentDay.format('MMMM, YYYY')}</h1>
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
          className='flex flex-col justify-between'
        >
          <CollapsibleContent className='CollapsibleContent'>
            <a
              href='#calendar-skip'
              className='absolute -left-[10000px] focus:left-6 focus:mt-2 focus:bg-slate-950 focus:px-2'
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
                        dots={dots?.filter(
                          d =>
                            dayjs(d.start).format('DD MM YYYY') ===
                            day.format('DD MM YYYY')
                        )}
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
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              className='h-auto w-full rounded-t-none p-0 py-1 hover:text-sky-500'
              aria-label={`${isOpened ? 'collapse' : 'open'} calendar`}
            >
              <ChevronUpIcon
                className='h-5 w-5 transition-[rotate]'
                style={{ rotate: isOpened ? '0deg' : '180deg' }}
              />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </section>
    </>
  );
}

function Day({
  day,
  dots,
  activeWeek = false,
  differentMonth = false,
}: {
  day: dayjs.Dayjs;
  dots: RouterOutputs['event']['getCalendarData'] | undefined;
  activeWeek?: boolean;
  differentMonth?: boolean;
}) {
  const { currentDay, selectDay } = useCalendar();

  const isSelected = useMemo(() => currentDay.isSame(day), [currentDay, day]);

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
      onClick={() => selectDay({ day })}
    >
      {day.date()}
      <div className='absolute bottom-[5px] left-1/2 flex w-full -translate-x-1/2 justify-center gap-0.5'>
        {dots?.slice(0, 4).map(session => (
          <div
            key={session.id}
            className={cn('h-[4px] w-[4px] rounded-full', {
              'bg-slate-50': isSelected,
              'bg-sky-500': !isSelected,
            })}
          />
        ))}
      </div>
    </button>
  );
}
