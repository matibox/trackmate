import { type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useCallback, useEffect, useState } from 'react';
import { useError } from '../hooks/useError';
import { api, type RouterOutputs } from '../utils/api';
import Filters from '~/features/setups/Filters';
import Setups from '~/features/setups/Setups';
import { useSetupStore } from '~/features/setups/store';
import useDebounce from '~/hooks/useDebounce';

type Setups = RouterOutputs['setup']['getAll'];

function useSetupFilters(query: string, setups: Setups | undefined) {
  const debouncedQuery = useDebounce(query);
  const [filteredSetups, setFilteredSetups] = useState(setups);

  const someIncludes = useCallback((items: string[], string: string) => {
    return items.some(item =>
      item.toLowerCase().includes(string.toLowerCase())
    );
  }, []);

  useEffect(() => {
    if (!setups) return;
    const q = debouncedQuery;
    setFilteredSetups(() =>
      setups.filter(setup => {
        const {
          author: { name: authorName },
          car,
          name,
          track,
        } = setup;
        return someIncludes([authorName ?? '', car, name, track], q);
      })
    );
  }, [someIncludes, debouncedQuery, setups]);

  return filteredSetups;
}

const YourSetups: NextPage = () => {
  const { Error, setError } = useError();
  const { filter } = useSetupStore();
  const { data: setups, isInitialLoading: isLoading } =
    api.setup.getAll.useQuery(
      { filter },
      {
        onError: err => setError(err.message),
      }
    );

  const [query, setQuery] = useState('');
  const filteredSetups = useSetupFilters(query, setups);

  return (
    <>
      <NextSeo title='Your setups' />
      <main className='min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)] text-slate-50'>
        <Error />
        <h1 className='py-8 text-center text-2xl font-semibold sm:text-3xl'>
          Your Setups
        </h1>
        <div className='grid grid-cols-1 grid-rows-[auto,_1fr] gap-y-4 px-4 md:grid-cols-[repeat(2,_calc(100%/2-0.5rem))] md:gap-y-0 md:gap-x-4 lg:grid-cols-[calc(100%/4-0.5rem),calc(100%/4*3-0.5rem)] xl:grid-cols-[calc(100%/5-0.5rem),calc(100%/5*4-0.5rem)]'>
          <Filters query={query} setQuery={setQuery} />
          <Setups setups={filteredSetups} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
};

export default YourSetups;
