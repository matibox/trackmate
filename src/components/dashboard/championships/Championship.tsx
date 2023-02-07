import {
  ArrowTopRightOnSquareIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useMemo, type FC } from 'react';
import cn from '../../../lib/classes';
import { useChampionshipStore } from '../../../store/useChampionshipStore';
import { type RouterOutputs } from '../../../utils/api';
import { capitilize } from '../../../utils/helpers';

type ChampionshipProps = {
  championship: RouterOutputs['championship']['get'][number];
};

const Championship: FC<ChampionshipProps> = ({ championship }) => {
  const {
    deleteChampionshipPopup: { open },
  } = useChampionshipStore();

  const { data: session } = useSession();

  const showDelete = useMemo(() => {
    const type = championship.type;
    if (type === 'sprint') return true;
    if (championship.managerId === session?.user?.id) return true;
    return false;
  }, [championship.type, championship.managerId, session?.user?.id]);

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
          {showDelete && (
            <Button
              intent='danger'
              size='small'
              gap='small'
              onClick={() => open(championship.id, championship.name)}
              className='h-7'
            >
              <span>Delete</span>
              <TrashIcon className='h-4' />
            </Button>
          )}
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        <div className='h-full w-full'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col'>
              <span className='text-slate-300'>Car</span>
              <span>{championship.car === '' ? '-' : championship.car}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-slate-300'>Type</span>
              <span>{capitilize(championship.type as string)}</span>
            </div>
            <div className='col-span-2 flex flex-col'>
              <span className='text-slate-300'>Roster</span>
              <span>
                {championship.drivers.map(driver => driver.name).join(', ')}
              </span>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2 border-t border-slate-700 pt-4 pl-2'>
          <span className='font-semibold'>Upcoming event</span>
          {championship.events.length > 0 ? (
            championship.events.map(event => (
              <div key={event.id} className='grid grid-cols-2 gap-y-4'>
                <div className='flex flex-col'>
                  <span className='text-slate-300'>Car</span>
                  <span>{event.car === '' ? '-' : event.car}</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-slate-300'>Track</span>
                  <span>{event.track}</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-slate-300'>Date</span>
                  <span>{dayjs(event.date).format('HH:mm DD MMM')}</span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-slate-300'>Duration</span>
                  <span>{event.duration} minutes</span>
                </div>
                <div
                  className={cn('col-span-2 hidden', {
                    'flex flex-col':
                      championship.type === 'sprint' && event.type === 'sprint',
                  })}
                >
                  <span className='text-slate-300'>Drivers</span>
                  <span>
                    {event.drivers.map(driver => driver.name).join(', ')}
                  </span>
                </div>
              </div>
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
