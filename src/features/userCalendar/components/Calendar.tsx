import Tile from '@ui/Tile';
import { Fragment, type FC } from 'react';
import { useCalendar } from '../hooks/useCalendar';
import dayjs from 'dayjs';
import { Day } from '~/features/dashboard/calendar/Day';
import Button from '@ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const UserCalendar: FC = () => {
  const {
    isLoading,
    calendarPage,
    Error,
    incrementMonth,
    decrementMonth,
    monthIndex,
  } = useCalendar();

  return (
    <Tile
      header={
        <div className='flex items-center justify-center'>
          <div className='flex w-[10.5rem] items-center gap-4'>
            <Button
              intent='secondary'
              size='xs'
              onClick={() => void decrementMonth()}
              aria-label='Previous month'
            >
              <ChevronLeftIcon className='h-6' />
            </Button>
            <h2 className='flex-1 text-center text-lg font-semibold'>
              {dayjs(new Date(dayjs().year(), monthIndex)).format('MMM YYYY')}
            </h2>
            <Button
              intent='secondary'
              size='xs'
              onClick={() => void incrementMonth()}
              aria-label='Next month'
            >
              <ChevronRightIcon className='h-6' />
            </Button>
          </div>
        </div>
      }
      isLoading={isLoading}
    >
      <div className='grid grid-cols-7 grid-rows-[20px,_repeat(6,_minmax(0,_1fr))] place-items-center gap-2 text-slate-50 sm:gap-4'>
        {calendarPage?.[0]?.map((day, i) => (
          <div
            key={i}
            className='text-center text-xs font-semibold uppercase sm:text-base'
          >
            {dayjs(day).format('ddd')}
          </div>
        ))}
        {calendarPage.map((row, i) => (
          <Fragment key={i}>
            {row.map((day, i) => (
              <Day key={i} day={day} />
            ))}
          </Fragment>
        ))}
      </div>
      <Error />
    </Tile>
  );
};

export default UserCalendar;
