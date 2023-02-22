import { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import dayjs from 'dayjs';
import Button from '@ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { CalendarIcon } from '@heroicons/react/24/solid';
import { api } from '../../../utils/api';

const CalendarHeader: FC = () => {
  const {
    monthIndex,
    incrementMonth,
    decrementMonth,
    selectedDay,
    selectDay,
    setLoading,
  } = useCalendarStore();

  const utils = api.useContext();

  const handleChangeMonth = async (
    changeMonthFn: () => void,
    sameMonthDayToSelect: dayjs.Dayjs
  ) => {
    setLoading(true);
    await utils.event.invalidate();
    changeMonthFn();
    if (monthIndex === selectedDay.month()) selectDay(sameMonthDayToSelect);
    setLoading(false);
  };

  const handlePrevMonth = async () => {
    await handleChangeMonth(
      decrementMonth,
      dayjs(
        new Date(
          dayjs().year(),
          monthIndex - 1,
          dayjs(new Date(dayjs().year(), monthIndex - 1)).daysInMonth()
        )
      )
    );
  };

  const handleNextMonth = async () => {
    await handleChangeMonth(
      incrementMonth,
      dayjs(new Date(dayjs().year(), monthIndex + 1, 1))
    );
  };

  return (
    <div className='flex items-center justify-center'>
      <h1 className='hidden gap-2 text-xl sm:inline-flex sm:items-center lg:gap-3'>
        <CalendarIcon className='h-6' />
        <span>Race calendar</span>
      </h1>
      <div className='flex w-[10.5rem] items-center gap-4 sm:ml-auto'>
        <Button
          intent='secondary'
          size='xs'
          onClick={() => void handlePrevMonth()}
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
          onClick={() => void handleNextMonth()}
          aria-label='Next month'
        >
          <ChevronRightIcon className='h-6' />
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
