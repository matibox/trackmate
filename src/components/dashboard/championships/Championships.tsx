import { ArrowSmallRightIcon } from '@heroicons/react/20/solid';
import Tile from '@ui/Tile';
import Link from 'next/link';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { api } from '../../../utils/api';
import Championship from './Championship';
import ChampionshipsHeader from './Header';

const Championships: FC = () => {
  const { Error, setError } = useError();

  const { data: championships, isLoading } = api.championship.get.useQuery(
    {},
    {
      onError: err => setError(err.message),
    }
  );

  return (
    <Tile
      header={<ChampionshipsHeader />}
      isLoading={isLoading}
      className='row-span-2'
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
