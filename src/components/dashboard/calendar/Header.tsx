import { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import dayjs from 'dayjs';
import Button from '@ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const CalendarHeader: FC = () => {
  const { monthIndex, incrementMonth, decrementMonth } = useCalendarStore();

  return (
    <div className='flex items-center justify-center text-xl md:text-2xl'>
      <h1 className='hidden sm:block'>Race calendar</h1>
      <div className='flex w-44 items-center gap-4 sm:ml-auto md:w-48'>
        <Button intent='secondary' size='xs' onClick={decrementMonth}>
          <ChevronLeftIcon className='h-6' />
        </Button>
        <h2 className='flex-1 text-center'>
          {dayjs(new Date(dayjs().year(), monthIndex)).format('MMM YYYY')}
        </h2>
        <Button intent='secondary' size='xs' onClick={incrementMonth}>
          <ChevronRightIcon className='h-6' />
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
