import { FilterIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import TeamList from './TeamList';
import { api } from '~/utils/api';

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
  const { data, ...rest } = api.team.listWithFilter.useInfiniteQuery(
    {
      limit: 32,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
      keepPreviousData: true,
    }
  );

  return {
    data: data?.pages?.flatMap(page => page.teams) ?? [],
    ...rest,
  };
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, error, status, hasNextPage, isFetching, fetchNextPage } =
    useTeamQuery();
  const { scrollPosition } = useScrollPosition();

  useEffect(() => {
    console.log(scrollPosition);
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
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <SearchIcon className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        </div>
        <Button variant='ghost' className='h-9 w-9 px-0'>
          <FilterIcon className='h-[18px] w-[18px] text-slate-50' />
        </Button>
      </div>
      <TeamList data={data} error={error} status={status} />
      <p className='text-center text-slate-300'>
        There are no more teams to load.
      </p>
    </>
  );
}
