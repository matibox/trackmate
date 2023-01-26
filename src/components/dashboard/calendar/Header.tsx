import { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import dayjs from 'dayjs';
import Button from '@ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { CalendarIcon } from '@heroicons/react/24/solid';

const CalendarHeader: FC = () => {
  const { monthIndex, incrementMonth, decrementMonth } = useCalendarStore();

  return (
    <div className='flex items-center justify-center'>
      <h1 className='hidden gap-2 text-xl sm:inline-flex sm:items-center lg:gap-3'>
        <CalendarIcon className='h-6' />
        <span>Race calendar</span>
      </h1>
      <div className='flex w-[10.5rem] items-center gap-4 sm:ml-auto'>
        <Button intent='secondary' size='xs' onClick={decrementMonth}>
          <ChevronLeftIcon className='h-6' />
        </Button>
        <h2 className='flex-1 text-center text-lg font-semibold'>
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
