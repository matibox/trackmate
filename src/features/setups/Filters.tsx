import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Tile from '@ui/Tile';
import { type Dispatch, type SetStateAction, type FC } from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';
import { useSetupStore } from './store';

type FiltersProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
};

const Filters: FC<FiltersProps> = ({ query, setQuery }) => {
  const {
    post: { open },
  } = useSetupStore();

  return (
    <Tile className='row-span-1'>
      <div className='flex w-full flex-col gap-4'>
        <label className='flex w-full items-center gap-2'>
          <MagnifyingGlassIcon className='h-5' />
          <Input
            className='h-7'
            placeholder='Name, car, track or author'
            value={query}
            onChange={e => setQuery(e.target.value)}
            error={undefined}
          />
        </label>
        <Button
          intent='primary'
          size='small'
          gap='small'
          className='mt-auto self-end'
          onClick={open}
        >
          <span>New setup</span>
          <PlusIcon className='h-5' />
        </Button>
      </div>
    </Tile>
  );
};

export default Filters;
