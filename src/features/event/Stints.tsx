import { PlusIcon } from '@heroicons/react/24/outline';
import { type FC } from 'react';
import { useStints } from './hooks/useStints';
import AddStint from './popups/AddStint';
import { useAddStintStore } from './store';

const Stints: FC = () => {
  const { totalDuration: duration } = useStints();
  const { open } = useAddStintStore();

  return (
    <>
      <AddStint />
      <div className='flex flex-col gap-4'>
        <button
          className='flex h-8 items-center justify-center rounded px-2 py-1 text-slate-300 ring-1 ring-slate-800 transition hover:bg-slate-800 hover:ring-slate-700'
          title='Add new stint'
          aria-label='Add new stint'
          onClick={open}
        >
          <PlusIcon className='h-[22px]' />
        </button>
        <h2>
          Event duration: <span className='font-semibold'>{duration}</span>
        </h2>
      </div>
    </>
  );
};

export default Stints;
