import dayjs from 'dayjs';
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { generateDayGrid } from '~/lib/dates';
import { useCalendar } from './store';
import { cn, getCalendarRowStyles } from '~/lib/utils';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import { useEffect, useMemo, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/Collapsible';
import { type RouterOutputs, api } from '~/utils/api';
import { useFirstRender } from '~/hooks/useFirstRender';

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

export default function Calendar() {
  const { currentDay, nextMonth, prevMonth } = useCalendar();

  const dayGrid = generateDayGrid(currentDay.month(), currentDay.year());

  const [isOpened, setIsOpened] = useState(true);

  const { data: dots, isLoading } = api.event.getCalendarData.useQuery(
    {
      from: currentDay.date(1).toDate(),
      to: currentDay.date(currentDay.daysInMonth()).toDate(),
    },
    {
      enabled: isOpened,
    }
  );

  return (
    <section className='flex w-full max-w-lg flex-col rounded-md border border-slate-800 bg-slate-900 md:sticky md:left-0 md:top-[5.5rem] md:col-start-1 md:gap-4 2xl:static 2xl:h-min'>
      <header className='flex w-full items-center justify-between px-4 py-2 md:gap-2 md:pb-0'>
        <Button
          aria-label='previous month'
          variant='outline'
          className='h-8 w-8 bg-transparent p-0 md:ml-auto'
          onClick={prevMonth}
        >
          <ChevronLeftIcon className='h-5 w-5' />
        </Button>
        <h1 className='text-lg leading-none md:-order-1 md:text-2xl lg:text-3xl'>
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
                  className='flex h-[37px] w-[37px] items-center justify-center text-sm font-medium text-slate-300 lg:h-[45px] lg:w-[45px] lg:text-base'
                >
                  {dayjs(day).format('dd')}
                </span>
              ))}
            </div>
            <div className='flex flex-col items-center gap-3'>
              {dayGrid.map((row, i) => (
                <Row key={i} row={row} dots={dots} isLoading={isLoading} />
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

function Row({
  row,
  dots,
  isLoading = false,
}: {
  row: dayjs.Dayjs[];
  dots: RouterOutputs['event']['getCalendarData'] | undefined;
  isLoading?: boolean;
}) {
  const { currentDay } = useCalendar();
  const [showRow, setShowRow] = useState(false);

  const [rowStyles, setRowStyles] =
    useState<ReturnType<typeof getCalendarRowStyles>>();

  useEffect(() => {
    if (typeof window === undefined) return;
    setRowStyles(getCalendarRowStyles({ row, currentDay: dayjs() }));
    setShowRow(dayjs().week() === row[0]?.week());
  }, [currentDay, row]);

  return (
    <div className='relative flex gap-3'>
      {row.map((day, i) => (
        <Day
          key={i}
          day={day}
          hasEvent={
            !isLoading &&
            dots?.filter(
              d =>
                dayjs(d.start).format('DD MM YYYY') === day.format('DD MM YYYY')
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
        className={cn('absolute top-0 h-full rounded-md transition', {
          'bg-slate-800': showRow,
        })}
        style={rowStyles}
      />
    </div>
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
  const firstRender = useFirstRender();

  const isSelected = useMemo(() => currentDay.isSame(day), [currentDay, day]);

  return (
    <button
      className={cn(
        'relative z-10 flex h-[37px] w-[37px] items-center justify-center rounded-md text-sm transition hover:bg-slate-800 lg:h-[45px] lg:w-[45px]',
        {
          'hover:bg-slate-700': !firstRender && activeWeek,
          'bg-sky-500 hover:bg-sky-500 focus:bg-sky-500':
            !firstRender && isSelected,
          'text-slate-400 opacity-50': !firstRender && differentMonth,
          'ring-1 ring-slate-300':
            !firstRender &&
            day.format('DDMMYYYY') === dayjs().format('DDMMYYYY'),
        }
      )}
      onClick={() => selectDay({ day })}
    >
      {day.date()}
      {hasEvent ? (
        <div className='absolute bottom-[5px] left-1/2 flex w-full -translate-x-1/2 justify-center gap-0.5 lg:bottom-[6px]'>
          <div
            className={cn('h-1 w-1 rounded-full', {
              'bg-slate-50': isSelected,
              'bg-sky-500': !isSelected,
            })}
          />
        </div>
      ) : null}
    </button>
  );
}
