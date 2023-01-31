import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { type FC } from 'react';
import cn from '../../../lib/classes';
import { type RouterOutputs } from '../../../utils/api';
import { capitilize } from '../../../utils/helpers';

type ChampionshipProps = {
  championship: RouterOutputs['championship']['get'][number];
};

const Championship: FC<ChampionshipProps> = ({ championship }) => {
  return (
    <Tile
      className='flex w-full'
      header={
        <a
          href={championship.link}
          target='_blank'
          className='group flex items-center gap-2 font-semibold'
          rel='noreferrer'
        >
          <span className='transition-colors group-hover:text-sky-400'>
            {championship.organizer} - {championship.name}
          </span>
          <ArrowTopRightOnSquareIcon className='h-5 text-slate-300 transition-colors group-hover:text-sky-400' />
        </a>
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
                  <span>{dayjs(event.date).format('HH:MM DD MMM')}</span>
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
