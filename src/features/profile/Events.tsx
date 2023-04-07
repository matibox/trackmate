import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import Tile from '@ui/Tile';
import { type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';
import Event from './Event';
import { useRouter } from 'next/router';

type EventsProps = {
  profile: RouterOutputs['user']['getProfile'] | undefined;
  isLoading: boolean;
};

const Events: FC<EventsProps> = ({ profile, isLoading }) => {
  const router = useRouter();
  const { userId } = router.query;

  return (
    <Tile
      className='md:col-span-2 xl:col-span-3'
      header={
        <div className='flex items-center gap-2'>
          <CalendarDaysIcon className='h-6' />
          <h1 className='text-lg font-semibold'>Events</h1>
        </div>
      }
      isLoading={isLoading}
      fixedHeader
    >
      <div className='grid grid-cols-[repeat(auto-fit,_min(100%,_22rem))] justify-center gap-4'>
        {profile?.events.map(event => (
          <Event key={event.id} event={event} profileId={userId as string} />
        ))}
        {profile?.events.length === 0 && !isLoading && (
          <span className='text-slate-300'>There are no events</span>
        )}
      </div>
    </Tile>
  );
};

export default Events;
