import { PlusIcon } from '@heroicons/react/24/outline';
import { type FC } from 'react';
import { type Event } from '~/pages/event/[eventId]';
import { useStints } from './hooks/useStints';

const Stints: FC<{ event: Event }> = ({ event }) => {
  const { duration } = useStints(event);

  return (
    <div className='flex flex-col gap-4'>
      <button
        className='flex h-8 items-center justify-center rounded px-2 py-1 text-slate-300 ring-1 ring-slate-800 transition hover:bg-slate-800 hover:ring-slate-700'
        title='Add new stint'
        aria-label='Add new stint'
      >
        <PlusIcon className='h-[22px]' />
      </button>
      <h2>
        Event duration: <span className='font-semibold'>{duration}</span>
      </h2>
    </div>
  );
};

export default Stints;
