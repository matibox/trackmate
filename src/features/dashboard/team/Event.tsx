import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { type FC } from 'react';
import DriverList from '~/components/common/DriverList';
import EventDuration from '~/components/common/EventDuration';
import { type RouterOutputs } from '~/utils/api';

type EventProps = {
  event: NonNullable<RouterOutputs['team']['getDriveFor']>['events'][number];
};

const Event: FC<EventProps> = ({ event }) => {
  return (
    <Tile
      header={
        <div className='flex items-center gap-4 rounded bg-slate-700'>
          <span className='text-base font-semibold sm:text-lg'>
            {event.title}
          </span>
          <span className='ml-auto text-sm sm:text-base'>
            {dayjs(event.date).format('HH:mm DD MMM YYYY')}
          </span>
        </div>
      }
    >
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Car</span>
          <span>{event.car}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Track</span>
          <span>{event.track}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Duration</span>
          <EventDuration duration={event.duration} />
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Drivers</span>
          <span>
            <DriverList drivers={event.drivers} />
          </span>
        </div>
      </div>
    </Tile>
  );
};

export default Event;
