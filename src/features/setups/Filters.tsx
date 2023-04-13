import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Tile from '@ui/Tile';
import {
  type Dispatch,
  type SetStateAction,
  type FC,
  useEffect,
  useCallback,
} from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';
import { useSetupStore } from './store';
import { RadioGroup } from '@headlessui/react';
import cn from '~/lib/classes';
import { api } from '~/utils/api';

type FiltersProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
};

const Filters: FC<FiltersProps> = ({ query, setQuery }) => {
  const {
    filter,
    setFilter,
    post: { open },
  } = useSetupStore();

  const utils = api.useContext();
  const invalidateSetupsQuery = useCallback(async () => {
    await utils.setup.getAll.invalidate();
  }, [utils.setup.getAll]);

  useEffect(() => {
    void invalidateSetupsQuery();
  }, [filter, invalidateSetupsQuery]);

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
        <div className='flex w-full flex-col gap-2'>
          <span className='text-lg font-semibold'>Result filters</span>
          <RadioGroup
            value={filter}
            onChange={setFilter}
            className='flex w-full items-center gap-2'
          >
            <RadioGroup.Option value='all'>
              {({ checked }) => (
                <span
                  className={cn(
                    'cursor-pointer rounded bg-slate-600 px-2 py-1 transition-colors hover:bg-slate-500',
                    {
                      'border border-sky-500': checked,
                    }
                  )}
                >
                  All
                </span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value='your'>
              {({ checked }) => (
                <span
                  className={cn(
                    'cursor-pointer rounded bg-slate-600 px-2 py-1 transition-colors hover:bg-slate-500',
                    {
                      'border border-sky-500': checked,
                    }
                  )}
                >
                  Your
                </span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value='shared'>
              {({ checked }) => (
                <span
                  className={cn(
                    'cursor-pointer rounded bg-slate-600 px-2 py-1 transition-colors hover:bg-slate-500',
                    {
                      'border border-sky-500': checked,
                    }
                  )}
                >
                  Shared with you
                </span>
              )}
            </RadioGroup.Option>
          </RadioGroup>
        </div>
        <Button
          intent='primary'
          size='small'
          gap='small'
          className='mt-2 w-full self-start sm:w-auto'
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
