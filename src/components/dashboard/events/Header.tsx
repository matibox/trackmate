import { PlusIcon } from '@heroicons/react/20/solid';
import { CalendarDaysIcon } from '@heroicons/react/24/solid';
import Button from '@ui/Button';
import { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';

const EventsHeader: FC = () => {
  const { selectedDay } = useCalendarStore();

  return (
    <div className='flex items-center justify-between gap-4'>
      <h1 className='hidden gap-2 text-xl sm:inline-flex sm:items-center lg:gap-3'>
        <CalendarDaysIcon className='h-6' />
        <span>Details</span>
      </h1>
      <span className='text-lg sm:ml-auto'>
        {selectedDay.format('DD MMM YYYY')}
      </span>
      <Button intent='primary' size='small' gap='small'>
        <span>New event</span>
        <PlusIcon className='h-5' />
      </Button>
    </div>
  );
};

export default EventsHeader;