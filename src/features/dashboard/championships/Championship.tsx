import {
  ArrowTopRightOnSquareIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { type FC } from 'react';
import { useChampionshipStore } from './store';
import { type RouterOutputs } from '~/utils/api';
import { capitilize } from '~/utils/helpers';
import DriverList from '~/components/common/DriverList';
import EventDuration from '~/components/common/EventDuration';
import Details from '~/components/common/Details';

type ChampionshipProps = {
  championship: RouterOutputs['championship']['get'][number];
};

const Championship: FC<ChampionshipProps> = ({ championship }) => {
  const {
    delete: { open },
  } = useChampionshipStore();

  return (
    <Tile
      className='flex w-full'
      header={
        <div className='flex items-center justify-between'>
          <a
            href={championship.link}
            target='_blank'
            className='group flex items-center gap-2 font-semibold'
            rel='noreferrer'
          >
            <ArrowTopRightOnSquareIcon className='h-5 text-slate-300 transition-colors group-hover:text-sky-400' />
            <span
              className='transition-colors line-clamp-1 group-hover:text-sky-400'
              title={`${championship.organizer} - ${championship.name}`}
            >
              {championship.organizer} - {championship.name}
            </span>
          </a>
          <Button
            intent='subtleDanger'
            size='xs'
            gap='small'
            onClick={() => open(championship.id, championship.name)}
            className='h-7 p-1'
            aria-label='delete'
          >
            <TrashIcon className='h-4' />
          </Button>
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        <div className='h-full w-full'>
          <Details
            details={[
              {
                label: 'Car',
                value: championship.car === '' ? '-' : championship.car,
              },
              { label: 'Type', value: capitilize(championship.type as string) },
              {
                label: 'Roster',
                value: <DriverList drivers={championship.drivers} />,
                span: 2,
              },
              {
                condition: Boolean(championship.result),
                label: 'Championship position',
                value: championship.result?.position,
              },
            ]}
          />
        </div>
        <div className='flex flex-col gap-2 border-t border-slate-700 pt-4 pl-2'>
          <span className='font-semibold'>Upcoming event</span>
          {championship.events.length > 0 ? (
            championship.events.map(event => (
              <Details
                key={event.id}
                details={[
                  { label: 'Car', value: event.car === '' ? '-' : event.car },
                  { label: 'Track', value: event.track },
                  {
                    label: 'Date',
                    value: dayjs(event.date).format('HH:mm DD MMM'),
                  },
                  {
                    label: 'Duration',
                    value: <EventDuration duration={event.duration} />,
                  },
                  {
                    condition:
                      championship.type === 'endurance' &&
                      event.type === 'endurance',
                    label: 'Drivers',
                    value: <DriverList drivers={event.drivers} />,
                    span: 2,
                  },
                ]}
              />
            ))
          ) : (
            <span className='text-slate-300'>No upcoming events</span>
          )}
        </div>
      </div>
    </Tile>
  );
};

export default Championship;
