import { type FC, useState } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useEventSetupAssignStore } from '../store';
import { api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import useDebounce from '~/hooks/useDebounce';
import Input from '@ui/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Setup from '../components/Setup';

const AssignSetup: FC = () => {
  const { close, isOpened, eventId } = useEventSetupAssignStore();

  const { Error, setError } = useError();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);

  const { data: setups, isInitialLoading } = api.setup.byQuery.useQuery(
    {
      eventId,
      q: debouncedQuery,
    },
    {
      enabled: Boolean(debouncedQuery),
      onError: err => setError(err.message),
    }
  );

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='Assign new setup' />}
      isLoading={isInitialLoading}
      smallHeaderPadding
      className='max-w-sm md:max-w-[43rem]'
    >
      <div className='flex flex-col gap-4'>
        <div className='flex grow gap-4'>
          <label className='flex grow items-center gap-2 md:grow-0'>
            <MagnifyingGlassIcon className='h-5' />
            <Input
              className='h-7'
              placeholder='Name, car, track or author'
              value={query}
              onChange={e => setQuery(e.target.value)}
              error={undefined}
            />
          </label>
        </div>
        <div className='flex max-h-[25rem] flex-wrap gap-3 overflow-y-auto p-0.5 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'>
          {setups?.map(setup => (
            <Setup
              key={setup.id}
              setup={setup}
              isAssigned={false}
              eventId={eventId as string}
            />
          ))}
          {setups && setups.length === 0 && debouncedQuery ? (
            <span className='text-slate-300'>No setups found</span>
          ) : null}
        </div>
      </div>
      <Error />
    </Popup>
  );
};

export default AssignSetup;
