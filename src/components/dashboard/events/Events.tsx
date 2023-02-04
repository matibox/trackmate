import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useCallback, type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { type RouterOutputs } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import Event from './Event';
import EventsHeader from './Header';

const Events: FC = () => {
  const { data: session } = useSession();

  const { drivingEvents, managingEvents, selectedDay } = useCalendarStore();

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

  return (
    <Tile
      header={<EventsHeader />}
      className='scrollbar-slate-900 relative h-full max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'
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
        {(!todayManagingEvents || todayManagingEvents?.length === 0) &&
          (!todayDrivingEvents || todayDrivingEvents?.length === 0) && (
            <span className='text-slate-300'>No events for this day</span>
          )}
      </div>
    </Tile>
  );
};

export default Events;
