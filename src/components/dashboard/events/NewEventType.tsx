import TileButton from '@ui/TileButton';
import { type FC } from 'react';
import {
  defaultFormState,
  useNewEventStore,
} from '../../../store/useNewEventStore';

const NewEventType: FC = () => {
  const {
    formState: { newEventType },
    setFormState,
  } = useNewEventStore();

  return (
    <div className='flex justify-center gap-4'>
      <TileButton
        onClick={() =>
          setFormState({ ...defaultFormState, newEventType: 'oneOff' })
        }
        checked={newEventType === 'oneOff'}
        className='w-1/2'
        type='button'
      >
        <span className='text-xl font-semibold capitalize tracking-wide'>
          One off event
        </span>
        <span className='text-sm text-slate-300'>
          Create a one off event that is not associated with a championship
        </span>
      </TileButton>
      <TileButton
        onClick={() =>
          setFormState({ ...defaultFormState, newEventType: 'championship' })
        }
        checked={newEventType === 'championship'}
        className='w-1/2'
        type='button'
      >
        <span className='text-xl font-semibold capitalize tracking-wide'>
          Championship event
        </span>
        <span className='text-sm text-slate-300'>
          Create an event associated with a championship
        </span>
      </TileButton>
    </div>
  );
};

export default NewEventType;
