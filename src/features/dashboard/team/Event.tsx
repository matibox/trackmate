import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { type FC } from 'react';
import Details from '~/components/common/Details';
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
      <Details
        details={[
          { label: 'Car', value: event.car },
          { label: 'Track', value: event.track },
          {
            label: 'Duration',
            value: <EventDuration duration={event.duration} />,
          },
          { label: 'Drivers', value: <DriverList drivers={event.drivers} /> },
        ]}
      />
    </Tile>
  );
};

export default Event;
