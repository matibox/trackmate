import { PlusIcon } from '@heroicons/react/20/solid';
import { CalendarDaysIcon } from '@heroicons/react/24/solid';
import Button from '@ui/Button';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useNewEventStore } from '../../../store/useNewEventStore';
import { hasRole } from '../../../utils/helpers';

const EventsHeader: FC = () => {
  const { data: session } = useSession();
  const { selectedDay } = useCalendarStore();
  const { open } = useNewEventStore();

  return (
    <div className='flex items-center justify-between gap-4'>
      <h1 className='hidden gap-2 text-xl sm:inline-flex sm:items-center lg:gap-3'>
        <CalendarDaysIcon className='h-6' />
        <span>Details</span>
      </h1>
      <span className='text-lg sm:ml-auto'>
        {selectedDay.format('DD MMM YYYY')}
      </span>
      {(hasRole(session, 'driver') || hasRole(session, 'manager')) && (
        <Button intent='primary' size='small' gap='small' onClick={open}>
          <span>New event</span>
          <PlusIcon className='h-5' />
        </Button>
      )}
    </div>
  );
};

export default EventsHeader;
