import { type FC } from 'react';
import { type Event } from '~/pages/event/[eventId]';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import { PlusIcon } from '@heroicons/react/20/solid';
import { useEventSetupAssignStore } from './store';
import AssignSetup from './popups/AssignSetup';
import Setup from './components/Setup';

const Setups: FC<{ event: Event }> = ({ event }) => {
  const { open } = useEventSetupAssignStore();

  return (
    <>
      <AssignSetup />
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1 text-sm text-sky-400'>
              <CheckCircleIcon className='h-5' />
              <span>Active setup</span>
            </div>
            <div className='flex items-center gap-1 text-sm text-amber-400'>
              <ExclamationCircleIcon className='h-5' />
              <span>Setup got updated after last download</span>
            </div>
          </div>
          <h2 className='text-lg font-semibold'>Assigned setups</h2>
          <div>
            {event.setups.map(setup => (
              <Setup
                key={setup.id}
                setup={setup}
                eventId={event.id}
                isAssigned={true}
              />
            ))}
            {event.setups.length === 0 ? (
              <span className='text-slate-300'>
                There are no assigned setups
              </span>
            ) : null}
          </div>
        </div>
        <Button
          intent='primary'
          size='small'
          gap='small'
          className='self-start'
          onClick={() => open(event.id)}
        >
          <span>Assign setup</span>
          <PlusIcon className='h-5' />
        </Button>
      </div>
    </>
  );
};

export default Setups;
