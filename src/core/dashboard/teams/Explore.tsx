import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDebounce } from '~/hooks/useDebounce';
import { SearchIcon } from 'lucide-react';
import { Input } from '~/components/ui/Input';
import TeamList from './TeamList';
import { api } from '~/utils/api';

function useSearchQuery() {
  const router = useRouter();
  const initialQuery = (router.query.q as string | undefined) ?? '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState(initialQuery);

  useDebounce(
    () => {
      if (debouncedSearchQuery !== searchQuery) {
        setDebouncedSearchQuery(searchQuery);
      }
    },
    500,
    [searchQuery]
  );

  // update the URL with debouncedSearchQuery
  useEffect(() => {
    if (router.query.q !== debouncedSearchQuery) {
      void router.replace({
        query: { ...router.query, q: debouncedSearchQuery || undefined },
      });
    }
  }, [debouncedSearchQuery, router, router.query]);

  // update searchQuery when the URL changes
  useEffect(() => {
    if (router.query.q !== searchQuery) {
      setSearchQuery((router.query.q as string | undefined) ?? '');
    }
    // disabled due to infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.q]);

  return { searchQuery: debouncedSearchQuery, setSearchQuery };
}

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  function handleScroll() {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const scrolled = (winScroll / height) * 100;

    setScrollPosition(scrolled);
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { scrollPosition };
}

function useTeamQuery() {
  const { searchQuery, setSearchQuery } = useSearchQuery();
  const { data, ...rest } = api.team.listWithFilter.useInfiniteQuery(
    {
      limit: 32,
      searchQuery,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
      keepPreviousData: true,
    }
  );

  return {
    searchQuery,
    setSearchQuery,
    data: data?.pages?.flatMap(page => page.teams) ?? [],
    ...rest,
  };
}

export default function Explore() {
  const {
    searchQuery,
    setSearchQuery,
    data,
    error,
    status,
    hasNextPage,
    isFetching,
    fetchNextPage,
  } = useTeamQuery();
  const { scrollPosition } = useScrollPosition();

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      void fetchNextPage();
    }
  }, [scrollPosition, fetchNextPage, hasNextPage, isFetching]);

  return (
    <>
      <div className='flex w-full gap-4 self-start'>
        <div className='relative grow sm:grow-0'>
          <Input
            type='text'
            placeholder='Search'
            className='h-9 w-full placeholder:text-sm placeholder:font-medium sm:w-64'
            defaultValue={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <SearchIcon className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        </div>
      </div>
      <TeamList data={data} error={error} status={status} />
    </>
  );
}
