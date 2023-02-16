import { ArrowSmallRightIcon } from '@heroicons/react/20/solid';
import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import Championship from './Championship';
import ChampionshipsHeader from './Header';

const Championships: FC = () => {
  const { data: session } = useSession();
  const { Error, setError } = useError();

  const { data: championships, isLoading } = api.championship.get.useQuery(
    {},
    {
      onError: err => setError(err.message),
      enabled: Boolean(
        hasRole(session, 'driver') || hasRole(session, 'manager')
      ),
    }
  );

  if (!hasRole(session, 'driver') && !hasRole(session, 'manager')) return null;

  return (
    <Tile
      header={<ChampionshipsHeader />}
      isLoading={isLoading}
      className='col-start-1 col-end-1 row-span-2 overflow-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400 md:max-h-[1100px]'
      fixedHeader
    >
      {championships && championships.length > 0 ? (
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-4'>
            {championships.map(championship => (
              <Championship key={championship.id} championship={championship} />
            ))}
          </div>
          <Link
            href='/championships/all'
            className='flex items-center justify-center gap-1 self-end rounded bg-sky-500 px-4 py-1 text-sm font-semibold text-slate-50 ring-1 ring-sky-400 transition hover:bg-sky-400'
          >
            <span>Show all</span>
            <ArrowSmallRightIcon className='h-5' />
          </Link>
        </div>
      ) : (
        <span className='block text-center text-lg text-slate-300'>
          The are no championships
        </span>
      )}
      <Error />
    </Tile>
  );
};

export default Championships;
