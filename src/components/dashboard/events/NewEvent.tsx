import { XMarkIcon } from '@heroicons/react/24/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import { type FC } from 'react';

const NewEvent: FC = () => {
  return (
    <>
      <div className='fixed top-[var(--navbar-height)] left-0 h-full w-full bg-black/40 backdrop-blur-sm' />
      <Tile
        className='fixed top-1/2 left-1/2 w-[calc(100%_-_2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2'
        header={
          <div className='flex items-center justify-between'>
            <h1 className='text-xl'>New event</h1>
            <Button intent='secondary' size='xs'>
              <XMarkIcon className='h-6' />
            </Button>
          </div>
        }
      >
        new event form
      </Tile>
    </>
  );
};

export default NewEvent;
