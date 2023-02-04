import { TrashIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { type FC } from 'react';
import { useEventStore } from '../../../store/useEventStore';
import { type RouterOutputs } from '../../../utils/api';
import { capitilize } from '../../../utils/helpers';

type EventProps = {
  event: RouterOutputs['event']['getDrivingEvents'][number];
};

const Event: FC<EventProps> = ({ event }) => {
  const { open } = useEventStore();

  return (
    <Tile
      header={
        <div className='flex w-full items-center justify-between gap-4 rounded bg-slate-700'>
          <span className='text-base font-semibold'>
            {event.championship && (
              <>{capitilize(event.championship.name)} - </>
            )}
            {capitilize(event.title ?? '')}
          </span>
          <Button
            intent='danger'
            size='small'
            gap='small'
            onClick={() =>
              open(event.id, event.championship?.name, event.title ?? undefined)
            }
          >
            <span>Delete</span>
            <TrashIcon className='h-4' />
          </Button>
        </div>
      }
    >
      <div className='grid grid-cols-2 gap-y-4 sm:grid-cols-3'>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Car</span>
          <span>{event.car}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Track</span>
          <span>{event.track}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Type</span>
          <span>{capitilize(event.type)}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Duration</span>
          <span>{event.duration} minutes</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Start at</span>
          <span>{dayjs(event.date).format('HH:MM')}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Drivers</span>
          <span>{event.drivers.map(driver => driver.name).join(', ')}</span>
        </div>
      </div>
    </Tile>
  );
};

export default Event;
