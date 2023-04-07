import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useCallback, type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';
import { hasRole } from '~/utils/helpers';
import Event from './Event';
import { useCalendarStore } from '../calendar/store';
import { PlusIcon } from '@heroicons/react/20/solid';
import { CalendarDaysIcon } from '@heroicons/react/24/solid';
import Button from '@ui/Button';
import { useEventStore } from './store';

const Events: FC = () => {
  const { data: session } = useSession();

  const { drivingEvents, managingEvents, teamEvents, selectedDay } =
    useCalendarStore();

  const {
    create: { open },
  } = useEventStore();

  const getTodayEvents = useCallback(
    (events: RouterOutputs['event']['getDrivingEvents'] | undefined) => {
      return events?.filter(
        event =>
          dayjs(event.date).format('YYYY MM DD') ===
          selectedDay.format('YYYY MM DD')
      );
    },
    [selectedDay]
  );

  const todayDrivingEvents = getTodayEvents(drivingEvents);
  const todayManagingEvents = getTodayEvents(managingEvents);
  const todayTeamEvents = getTodayEvents(teamEvents);

  return (
    <Tile
      header={
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
      }
      className='scrollbar-slate-900 relative h-full max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'
      fixedHeader
    >
      <div className='flex flex-col gap-4'>
        {hasRole(session, 'driver') &&
          todayDrivingEvents &&
          todayDrivingEvents.length > 0 && (
            <div className='flex flex-col gap-4'>
              <h2 className='text-xl font-semibold'>Driving:</h2>
              {todayDrivingEvents.map(event => (
                <Event key={event.id} event={event} />
              ))}
            </div>
          )}
        {hasRole(session, 'manager') &&
          todayManagingEvents &&
          todayManagingEvents.length > 0 && (
            <div className='flex flex-col gap-4'>
              <h2 className='text-xl font-semibold'>Managing:</h2>
              {todayManagingEvents.map(event => (
                <Event key={event.id} event={event} />
              ))}
            </div>
          )}
        {todayTeamEvents && todayTeamEvents.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h2 className='text-xl font-semibold'>Team events:</h2>
            {todayTeamEvents.map(event => (
              <Event key={event.id} event={event} isTeamEvent />
            ))}
          </div>
        )}
        {(!todayManagingEvents || todayManagingEvents?.length === 0) &&
          (!todayDrivingEvents || todayDrivingEvents?.length === 0) &&
          (!todayTeamEvents || todayTeamEvents.length === 0) && (
            <span className='text-slate-300'>No events for this day</span>
          )}
      </div>
    </Tile>
  );
};

export default Events;
